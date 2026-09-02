const { Order, OrderItem, Cart, CartItem, Product, sequelize } = require('../models');
const { Op, literal } = require('sequelize');
const stripeService = require('../services/stripeService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { getPagination, getPagingData } = require('../utils/pagination');
const { isOrderStatus, canTransition, nextStatuses } = require('../utils/orderStatus');

/**
 * Turn the client's cart payload into line items priced from the database.
 * Only the product id and the quantity are taken from the request; the name,
 * image and unit price always come from our own records.
 *
 * @param {Array} items - Raw cart entries sent by the browser
 * @returns {Promise<{ lineItems: Array } | { error: { status: number, message: string } }>}
 */
const buildLineItemsFromCatalog = async (items) => {
  const quantityByProductId = new Map();

  for (const item of items) {
    const productId = item && item.id;
    const quantity = Number(item && item.quantity !== undefined ? item.quantity : 1);

    if (typeof productId !== 'string' || productId.length === 0) {
      return { error: { status: 400, message: 'Identifiant de produit invalide' } };
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: { status: 400, message: 'Quantité invalide' } };
    }

    quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + quantity);
  }

  const products = await Product.findAll({
    where: { id: Array.from(quantityByProductId.keys()) }
  });

  if (products.length !== quantityByProductId.size) {
    return { error: { status: 404, message: "Un produit du panier n'est plus disponible" } };
  }

  const lineItems = [];
  for (const product of products) {
    const quantity = quantityByProductId.get(product.id);

    if (product.stock < quantity) {
      return { error: { status: 400, message: `Stock insuffisant pour : ${product.name}` } };
    }

    lineItems.push({
      name: product.name,
      imageUrl: product.imageUrl,
      price: Number(product.price),
      quantity
    });
  }

  return { lineItems };
};

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Le panier est vide');
    }

    const { lineItems, error: validationError } = await buildLineItemsFromCatalog(items);
    if (validationError) {
      throw new AppError(validationError.message, validationError.status);
    }

    const session = await stripeService.createCheckoutSession(
      lineItems,
      `${process.env.APP_URL}/cart?success=true`,
      `${process.env.APP_URL}/cart?canceled=true`
    );

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  // Opened only once every check has passed, so no early return can leak a
  // transaction and no error path can roll back a committed one.
  let transaction = null;

  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || shippingAddress.trim().length === 0) {
      throw AppError.badRequest('shippingAddress is required');
    }

    // 1. Get user's cart with items and product details
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        include: [Product]
      }]
    });

    if (!cart || cart.CartItems.length === 0) {
      throw AppError.badRequest('Cart is empty');
    }

    // 2. Calculate total and verify stock
    let totalAmount = 0;
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        throw AppError.badRequest(`Insufficient stock for product: ${item.Product.name}`);
      }
      totalAmount += Number(item.Product.price) * item.quantity;
    }
    totalAmount = Math.round(totalAmount * 100) / 100;

    // 3. Create the Stripe Payment Intent before opening the transaction, so a
    //    slow network round trip never holds a database connection open.
    const paymentIntent = await stripeService.createPaymentIntent(totalAmount);

    transaction = await sequelize.transaction();

    // 4. Create Order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    }, { transaction });

    // 5. Create Order Items & Update Stock
    for (const item of cart.CartItems) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw AppError.badRequest(`Invalid quantity for product: ${item.Product.name}`);
      }

      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity,
        priceAtPurchase: item.Product.price
      }, { transaction });

      // The stock check in step 2 read a value another checkout may already
      // have claimed. Re-assert it inside the UPDATE so the database, not this
      // process, decides who gets the last unit.
      const [rowsUpdated] = await Product.update(
        { stock: literal(`stock - ${quantity}`) },
        {
          where: { id: item.productId, stock: { [Op.gte]: quantity } },
          transaction
        }
      );

      if (rowsUpdated === 0) {
        throw AppError.badRequest(`Insufficient stock for product: ${item.Product.name}`);
      }
    }

    // 6. Clear Cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();
    transaction = null;

    // 7. Send Notification (Async)
    notificationService.orderConfirmed(req.user, order).catch((err) => {
      logger.error('Order confirmation notification failed', { orderId: order.id, error: err.message });
    });

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { limit: pageSize, offset } = getPagination({ page, limit });

    const data = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: [OrderItem],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
      // Without distinct, the OrderItem join multiplies the count by the number
      // of lines per order and totalPages comes out several times too large.
      distinct: true
    });

    res.json(getPagingData(data, page, pageSize));
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!order) {
      throw AppError.notFound('Order not found');
    }

    // Check ownership
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      throw AppError.forbidden('Not authorized');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!isOrderStatus(status)) {
      throw AppError.badRequest(`Unknown status: ${status}`);
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    if (order.status === status) {
      return res.json(order);
    }

    if (!canTransition(order.status, status)) {
      const reachable = nextStatuses(order.status);
      throw AppError.conflict(
        reachable.length > 0
          ? `An order in "${order.status}" can only move to: ${reachable.join(', ')}`
          : `An order in "${order.status}" is final and cannot change status`
      );
    }

    await order.update({ status });
    logger.info('Order status updated', {
      orderId: order.id,
      status,
      updatedBy: req.user.id
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = await stripeService.handleWebhook(sig, req.body);
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      const order = await Order.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: ['User']
      });

      if (!order) {
        logger.warn('No order matches the paid payment intent', { paymentIntentId: paymentIntent.id });
      } else if (order.status !== 'pending') {
        // Stripe redelivers an event until it sees a 2xx, so the same success
        // arrives more than once. Only a pending order may move to paid: a
        // replay must not re-notify the customer, and an order already shipped
        // or delivered must not be dragged backwards.
        logger.info('Ignoring payment event for a non-pending order', {
          orderId: order.id,
          status: order.status
        });
      } else {
        await order.update({ status: 'paid' });
        notificationService.paymentSuccess(order.User, order).catch((notifyErr) => {
          logger.error('Payment notification failed', { orderId: order.id, error: notifyErr.message });
        });
        logger.info('Order marked as paid', { orderId: order.id, paymentIntentId: paymentIntent.id });
      }
    }
  } catch (err) {
    logger.error('Webhook event processing error', { error: err.message });
    // Still return 200 to prevent Stripe from retrying
  }

  res.json({ received: true });
};
