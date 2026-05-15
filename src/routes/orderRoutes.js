const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  createCheckoutSession,
  webhookHandler
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Webhook must be BEFORE protect middleware because it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

router.use(protect);

router.post('/checkout-session', createCheckoutSession);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

module.exports = router;
