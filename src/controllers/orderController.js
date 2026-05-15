const { Order, OrderItem, Cart, CartItem, Product, sequelize } = require('../models');
const stripeService = require('../services/stripeService');
const notificationService = require('../services/notificationService');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide' });
    }

    const session = await stripeService.createCheckoutSession(
      items,
      `${process.env.APP_URL}/cart?success=true`,
      `${process.env.APP_URL}/cart?canceled=true`
    );

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { shippingAddress } = req.body;
    
    // 1. Get user's cart with items and product details
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        include: [Product]
      }]
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Calculate total and verify stock
    let totalAmount = 0;
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${item.Product.name}`);
      }
      totalAmount += item.Product.price * item.quantity;
    }

    // 3. Create Stripe Payment Intent
    const paymentIntent = await stripeService.createPaymentIntent(totalAmount);

    // 4. Create Order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    }, { transaction: t });

    // 5. Create Order Items & Update Stock
    for (const item of cart.CartItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.Product.price
      }, { transaction: t });

      // Atomically decrement stock
      await item.Product.decrement('stock', { by: item.quantity, transaction: t });
    }

    // 6. Clear Cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    // 7. Send Notification (Async)
    notificationService.orderConfirmed(req.user, order).catch(console.error);

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [OrderItem],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = await stripeService.handleWebhook(sig, req.body);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Find order and user to send notification
    const order = await Order.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: ['User']
    });

    if (order) {
      await order.update({ status: 'paid' });
      notificationService.paymentSuccess(order.User, order).catch(console.error);
    }
    
    console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
  }

  res.json({ received: true });
};
