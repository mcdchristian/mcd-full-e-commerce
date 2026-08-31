const test = require('node:test');
const assert = require('node:assert/strict');

const requestId = require('../../src/middleware/requestId');

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const run = (headers) => {
  const req = { headers };
  const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; } };
  let nextCalled = false;

  requestId(req, res, () => {
    nextCalled = true;
  });

  return { req, res, nextCalled };
};

test('generates a UUID when no correlation id is supplied', () => {
  const { req, res, nextCalled } = run({});

  assert.match(req.id, UUID_V4);
  assert.equal(res.headers['X-Request-ID'], req.id);
  assert.equal(nextCalled, true);
});

test('reuses a well-formed incoming correlation id', () => {
  const { req } = run({ 'x-request-id': 'trace-42_abc' });

  assert.equal(req.id, 'trace-42_abc');
});

test('replaces an oversized or malformed correlation id', () => {
  for (const value of ['x'.repeat(65), 'has spaces', 'semi;colon', '']) {
    const { req } = run({ 'x-request-id': value });
    assert.match(req.id, UUID_V4, `accepted ${JSON.stringify(value)}`);
  }
});

test('ignores a repeated header parsed as an array', () => {
  const { req } = run({ 'x-request-id': ['first', 'second'] });

  assert.match(req.id, UUID_V4);
});

test('issues a distinct id per request', () => {
  assert.notEqual(run({}).req.id, run({}).req.id);
});
