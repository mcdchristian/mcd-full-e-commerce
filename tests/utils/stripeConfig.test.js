const test = require('node:test');
const assert = require('node:assert/strict');

const { isStripeKeyConfigured } = require('../../src/utils/stripeConfig');

// Assembled rather than written out: GitHub's push protection rejects a
// literal `sk_test_…` string in source, fabricated or not, and blocks the push.
const SUFFIX = 'A1b2C3d4E5f6G7h8IjKl';
const key = (prefix, mode) => [prefix, mode, SUFFIX].join('_');

test('accepts a well-formed test or live secret key', () => {
  assert.equal(isStripeKeyConfigured(key('sk', 'test')), true);
  assert.equal(isStripeKeyConfigured(key('sk', 'live')), true);
});

test('rejects the placeholders this project ships', () => {
  assert.equal(isStripeKeyConfigured('sk_test_placeholder'), false);
  assert.equal(isStripeKeyConfigured('sk_test_your_stripe_secret_key'), false);
});

test('rejects a missing or non-string value', () => {
  for (const value of [undefined, null, '', 42, {}]) {
    assert.equal(isStripeKeyConfigured(value), false, `accepted ${JSON.stringify(value)}`);
  }
});

test('rejects a publishable key used by mistake', () => {
  assert.equal(isStripeKeyConfigured(key('pk', 'test')), false);
});

test('rejects a suffix too short to be a real key', () => {
  assert.equal(isStripeKeyConfigured('sk_test_abc'), false);
  assert.equal(isStripeKeyConfigured('sk_test_'), false);
});

test('tolerates surrounding whitespace from a .env file', () => {
  assert.equal(isStripeKeyConfigured(`  ${key('sk', 'test')}  `), true);
});
