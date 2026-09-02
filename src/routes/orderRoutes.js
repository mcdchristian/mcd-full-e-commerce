const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  createCheckoutSession,
  updateOrderStatus,
  webhookHandler
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderSchemas } = require('../middleware/validationSchemas');

// Webhook must be BEFORE protect middleware because it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

router.use(protect);

router.post('/checkout-session', validate(orderSchemas.checkout), createCheckoutSession);
router.post('/', validate(orderSchemas.create), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Fulfilment is a back-office action; the webhook owns the pending -> paid move.
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(orderSchemas.updateStatus),
  updateOrderStatus
);

module.exports = router;
