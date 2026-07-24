const { Cart, CartItem, Product } = require('../models');

exports.getCart = async (req, res) => {
  try {
    const [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id }
    });

    const fullCart = await Cart.findByPk(cart.id, {
      include: [{
        model: CartItem,
        include: [Product]
      }]
    });

    res.json(fullCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // Verify product exists and has stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id }
    });

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    const newQty = (cartItem ? cartItem.quantity : 0) + (quantity || 1);
    if (newQty > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (cartItem) {
      cartItem.quantity = newQty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: quantity || 1
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, cartId: cart.id }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, cartId: cart.id }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
