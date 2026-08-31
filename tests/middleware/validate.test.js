const test = require('node:test');
const assert = require('node:assert/strict');

const validate = require('../../src/middleware/validate');
const { runMiddleware } = require('../helpers/express');

const check = (schema, body) => runMiddleware(validate(schema), { body });

test('calls next() when every field satisfies the schema', () => {
  const { res, nextCalled } = check(
    {
      email: { type: 'email', required: true },
      password: { type: 'string', required: true, minLength: 6 }
    },
    { email: 'alice@example.com', password: 'hunter2!' }
  );

  assert.equal(nextCalled, true);
  assert.equal(res.jsonCalled, false);
});

test('rejects a missing required field with 400', () => {
  const { res, nextCalled } = check({ email: { type: 'email', required: true } }, {});

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Validation failed');
  assert.deepEqual(res.body.errors, ['email is required']);
});

test('treats an empty string as a missing required field', () => {
  const { res } = check({ firstName: { type: 'string', required: true } }, { firstName: '' });

  assert.deepEqual(res.body.errors, ['firstName is required']);
});

test('skips optional fields that are absent', () => {
  const { nextCalled } = check(
    { stock: { type: 'number', required: false, min: 0 } },
    { name: 'ignored' }
  );

  assert.equal(nextCalled, true);
});

test('reports a type mismatch for strings and numbers', () => {
  const { res } = check(
    {
      name: { type: 'string', required: true },
      price: { type: 'number', required: true }
    },
    { name: 42, price: '19.99' }
  );

  assert.deepEqual(res.body.errors, ['name must be a string', 'price must be a valid number']);
});

test('rejects malformed email addresses', () => {
  for (const email of ['not-an-email', 'missing@domain', 'spaced out@example.com']) {
    const { res } = check({ email: { type: 'email', required: true } }, { email });
    assert.deepEqual(res.body.errors, ['email must be a valid email address'], `accepted ${email}`);
  }
});

test('enforces string length boundaries', () => {
  const schema = { password: { type: 'string', required: true, minLength: 6, maxLength: 10 } };

  assert.deepEqual(check(schema, { password: 'short' }).res.body.errors, [
    'password must be at least 6 characters'
  ]);
  assert.deepEqual(check(schema, { password: 'far too long to pass' }).res.body.errors, [
    'password must be at most 10 characters'
  ]);
  assert.equal(check(schema, { password: 'exactly6' }).nextCalled, true);
});

test('enforces the numeric minimum', () => {
  const { res } = check({ price: { type: 'number', required: true, min: 0 } }, { price: -5 });

  assert.deepEqual(res.body.errors, ['price must be at least 0']);
});

test('collects every violation in a single response', () => {
  const { res } = check(
    {
      firstName: { type: 'string', required: true },
      email: { type: 'email', required: true },
      password: { type: 'string', required: true, minLength: 6 }
    },
    { email: 'nope', password: 'abc' }
  );

  assert.equal(res.body.errors.length, 3);
});
