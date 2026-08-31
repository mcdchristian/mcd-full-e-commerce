const test = require('node:test');
const assert = require('node:assert/strict');

const { success, error } = require('../../src/utils/apiResponse');
const { createResponse } = require('../helpers/express');

test('wraps a payload in a success envelope with a 200 default', () => {
  const res = createResponse();
  success(res, { id: 'abc' });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, data: { id: 'abc' } });
});

test('honours an explicit success status code', () => {
  const res = createResponse();
  success(res, { id: 'abc' }, 201);

  assert.equal(res.statusCode, 201);
});

test('wraps a message in an error envelope with a 500 default', () => {
  const res = createResponse();
  error(res, 'Something broke');

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { success: false, message: 'Something broke' });
});

test('omits the errors key unless details are supplied', () => {
  const res = createResponse();
  error(res, 'Not found', 404);

  assert.equal(res.statusCode, 404);
  assert.ok(!('errors' in res.body));
});

test('includes detailed errors when supplied', () => {
  const res = createResponse();
  error(res, 'Validation failed', 400, ['email is required']);

  assert.deepEqual(res.body, {
    success: false,
    message: 'Validation failed',
    errors: ['email is required']
  });
});
