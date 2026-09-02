/**
 * Tell a usable Stripe secret key from a placeholder.
 *
 * `.env.example` ships `sk_test_your_stripe_secret_key`, and a local setup
 * often carries something equally inert. Handing one of those to the Stripe
 * SDK produces an "Invalid API Key" failure at checkout time, which reads like
 * a server fault rather than a missing configuration step.
 *
 * A real key is `sk_` then the mode then a long opaque suffix; the placeholders
 * are far shorter and describe themselves.
 */
const STRIPE_SECRET_KEY_PATTERN = /^sk_(test|live)_[A-Za-z0-9]{16,}$/;

/**
 * @param {*} key - Value of STRIPE_SECRET_KEY
 * @returns {boolean} True when the key is shaped like a real Stripe secret key
 */
const isStripeKeyConfigured = (key) =>
  typeof key === 'string' && STRIPE_SECRET_KEY_PATTERN.test(key.trim());

module.exports = { isStripeKeyConfigured, STRIPE_SECRET_KEY_PATTERN };
