const test = require('node:test');
const assert = require('node:assert/strict');

const authorize = require('../../src/middleware/authorize');
const AppError = require('../../src/utils/AppError');
const { runMiddleware } = require('../helpers/express');

const check = (roles, user) => runMiddleware(authorize(...roles), { user });

test('lets a matching role through', () => {
  const { nextCalled, nextError } = check(['admin'], { role: 'admin' });

  assert.equal(nextCalled, true);
  assert.equal(nextError, undefined);
});

test('accepts any of several allowed roles', () => {
  assert.equal(check(['admin', 'customer'], { role: 'customer' }).nextError, undefined);
  assert.equal(check(['admin', 'customer'], { role: 'admin' }).nextError, undefined);
});

test('refuses a role that is not listed', () => {
  const { nextError } = check(['admin'], { role: 'customer' });

  assert.ok(nextError instanceof AppError);
  assert.equal(nextError.statusCode, 403);
  assert.match(nextError.message, /customer/);
});

test('refuses an unauthenticated request instead of throwing', () => {
  for (const user of [undefined, null]) {
    const { nextError } = check(['admin'], user);

    assert.ok(nextError instanceof AppError, `threw for user=${user}`);
    assert.equal(nextError.statusCode, 401);
  }
});

test('never writes the response itself', () => {
  const { res } = check(['admin'], { role: 'customer' });

  assert.equal(res.jsonCalled, false);
});

test('an empty role list refuses everyone', () => {
  assert.equal(check([], { role: 'admin' }).nextError.statusCode, 403);
});
