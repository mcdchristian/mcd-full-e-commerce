const test = require('node:test');
const assert = require('node:assert/strict');

const AppError = require('../../src/utils/AppError');

test('is a real Error subclass', () => {
  const err = new AppError('boom');

  assert.ok(err instanceof Error);
  assert.ok(err instanceof AppError);
  assert.equal(err.name, 'AppError');
  assert.equal(err.message, 'boom');
  assert.ok(typeof err.stack === 'string' && err.stack.length > 0);
});

test('defaults to a 500 and marks the message as exposable', () => {
  const err = new AppError('boom');

  assert.equal(err.statusCode, 500);
  assert.equal(err.expose, true);
});

test('honours an explicit status code', () => {
  assert.equal(new AppError('teapot', 418).statusCode, 418);
});

test('exposes a factory per common status', () => {
  assert.equal(AppError.badRequest('bad').statusCode, 400);
  assert.equal(AppError.unauthorized().statusCode, 401);
  assert.equal(AppError.forbidden().statusCode, 403);
  assert.equal(AppError.notFound().statusCode, 404);
  assert.equal(AppError.conflict('taken').statusCode, 409);
});

test('factories carry the supplied message and a usable default', () => {
  assert.equal(AppError.notFound('Product not found').message, 'Product not found');
  assert.equal(AppError.notFound().message, 'Not found');
  assert.equal(AppError.unauthorized().message, 'Not authorized');
});

test('is distinguishable from a plain error at the catch site', () => {
  const errors = [new AppError('expected', 404), new TypeError('unexpected')];
  const exposable = errors.filter((e) => e instanceof AppError);

  assert.equal(exposable.length, 1);
  assert.equal(exposable[0].statusCode, 404);
});
