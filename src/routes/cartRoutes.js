const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { cartSchemas } = require('../middleware/validationSchemas');

router.use(protect);

router.get('/', getCart);
router.post('/', validate(cartSchemas.addItem), addToCart);
router.put('/item/:id', validate(cartSchemas.updateItem), updateCartItem);
router.delete('/item/:id', removeFromCart);

module.exports = router;
