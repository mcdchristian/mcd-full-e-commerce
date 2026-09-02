const Stripe = require('stripe');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { isStripeKeyConfigured } = require('../utils/stripeConfig');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PAYMENTS_UNAVAILABLE =
  "Le paiement est indisponible : la clé API Stripe n'est pas configurée sur ce serveur.";

/** Refuse before the round trip when the key is obviously a placeholder. */
const assertConfigured = () => {
  if (!isStripeKeyConfigured(process.env.STRIPE_SECRET_KEY)) {
    throw AppError.serviceUnavailable(PAYMENTS_UNAVAILABLE);
  }
};

/**
 * Translate a Stripe failure into something the caller can act on.
 * A key that looks well formed but Stripe rejects is still our configuration
 * problem, not something a shopper fixes by trying again.
 */
const toAppError = (error, fallbackMessage) => {
  if (error instanceof AppError) return error;
  if (error.type === 'StripeAuthenticationError') {
    return AppError.serviceUnavailable(PAYMENTS_UNAVAILABLE);
  }

  return new AppError(fallbackMessage, 502);
};

exports.createCheckoutSession = async (items, successUrl, cancelUrl) => {
  try {
    assertConfigured();

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
    throw toAppError(error, 'La session de paiement n\'a pas pu être créée.');
  }
};

exports.createPaymentIntent = async (amount, currency = 'eur') => {
  try {
    assertConfigured();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
    });
    return paymentIntent;
  } catch (error) {
    logger.error('Stripe payment intent creation failed', { error: error.message });
    throw toAppError(error, "L'intention de paiement n'a pas pu être créée.");
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
