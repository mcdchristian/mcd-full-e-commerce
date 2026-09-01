const test = require('node:test');
const assert = require('node:assert/strict');

const errorHandler = require('../../src/middleware/errorHandler');
const AppError = require('../../src/utils/AppError');
const { createResponse } = require('../helpers/express');

const { GENERIC_MESSAGE } = errorHandler;

const handle = (err, { env = 'production' } = {}) => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = env;

  const res = createResponse();
  res.headersSent = false;
  let forwarded;

  try {
    errorHandler(err, { id: 'req-1' }, res, (e) => {
      forwarded = e;
    });
  } finally {
    process.env.NODE_ENV = previous;
  }

  return { res, forwarded };
};

test('answers an AppError with its status and its message', (t) => {
  t.mock.method(console, 'warn', () => {});
  const { res } = handle(AppError.notFound('Product not found'));

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, 'Product not found');
  assert.equal(res.body.requestId, 'req-1');
});

test('hides the message of an unexpected failure', (t) => {
  t.mock.method(console, 'error', () => {});
  const { res } = handle(new Error('SequelizeDatabaseError: Unknown column users.secret'));

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, GENERIC_MESSAGE);
  assert.ok(!res.body.message.includes('secret'));
});

test('keeps the message of a 4xx raised outside our code', (t) => {
  t.mock.method(console, 'warn', () => {});
  // What express.json() throws on malformed input.
  const parseError = Object.assign(new SyntaxError('Unexpected token } in JSON'), { status: 400 });
  const { res } = handle(parseError);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Unexpected token } in JSON');
});

test('logs a server fault at error level and a client error at warn', (t) => {
  t.mock.method(console, 'error', () => {});
  t.mock.method(console, 'warn', () => {});

  handle(new Error('boom'));
  handle(AppError.badRequest('nope'));

  assert.equal(console.error.mock.callCount(), 1);
  assert.equal(console.warn.mock.callCount(), 1);
});

test('includes the stack only in development', (t) => {
  t.mock.method(console, 'error', () => {});

  assert.ok(!('stack' in handle(new Error('boom')).res.body));
  assert.ok('stack' in handle(new Error('boom'), { env: 'development' }).res.body);
});

test('delegates to express once the response has started', (t) => {
  t.mock.method(console, 'error', () => {});
  const err = new Error('too late');

  const res = createResponse();
  res.headersSent = true;
  let forwarded;
  errorHandler(err, { id: 'req-1' }, res, (e) => {
    forwarded = e;
  });

  assert.equal(forwarded, err);
  assert.equal(res.jsonCalled, false);
});
