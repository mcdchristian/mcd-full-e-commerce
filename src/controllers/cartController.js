const { Cart, CartItem, Product } = require('../models');
const AppError = require('../utils/AppError');

exports.getCart = async (req, res, next) => {
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
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      throw AppError.badRequest('productId is required');
    }

    // Verify product exists and has stock
    const product = await Product.findByPk(productId);
    if (!product) {
      throw AppError.notFound('Product not found');
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
      throw AppError.badRequest('Insufficient stock');
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
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw AppError.badRequest('quantity must be at least 1');
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, cartId: cart.id },
      include: [Product]
    });

    if (!cartItem) {
      throw AppError.notFound('Cart item not found');
    }

    if (!cartItem.Product) {
      throw AppError.notFound('Product not found');
    }

    if (quantity > cartItem.Product.stock) {
      throw AppError.badRequest('Insufficient stock');
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, cartId: cart.id }
    });

    if (!cartItem) {
      throw AppError.notFound('Cart item not found');
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    const deletedCount = await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({
      message: 'Cart cleared successfully',
      itemsRemoved: deletedCount
    });
  } catch (error) {
    next(error);
  }
};
