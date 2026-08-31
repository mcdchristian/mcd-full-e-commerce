const Stripe = require('stripe');
const logger = require('../utils/logger');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (items, successUrl, cancelUrl) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            // Stripe rejects a null entry, so only send the key when we have one.
            ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  } catch (error) {
    logger.error('Stripe checkout session creation failed', { error: error.message });
    throw new Error('Checkout session creation failed');
  }
};

exports.createPaymentIntent = async (amount, currency = 'eur') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
    });
    return paymentIntent;
  } catch (error) {
    logger.error('Stripe payment intent creation failed', { error: error.message });
    throw new Error('Payment intent creation failed');
  }
};

exports.handleWebhook = async (sig, payload) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }
};
