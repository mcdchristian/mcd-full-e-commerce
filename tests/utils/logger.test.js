const test = require('node:test');
const assert = require('node:assert/strict');

const logger = require('../../src/utils/logger');

const ISO_TIMESTAMP = /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]/;

test('prefixes entries with an ISO timestamp and the level', (t) => {
  t.mock.method(console, 'log', () => {});
  logger.info('Server started');

  const [line] = console.log.mock.calls[0].arguments;
  assert.match(line, ISO_TIMESTAMP);
  assert.match(line, /\[INFO\] Server started$/);
});

test('appends metadata as JSON', (t) => {
  t.mock.method(console, 'error', () => {});
  logger.error('Connection failed', { attempt: 2, host: 'db' });

  const [line] = console.error.mock.calls[0].arguments;
  assert.match(line, /\[ERROR\] Connection failed \{"attempt":2,"host":"db"\}$/);
});

test('omits the metadata segment when it is empty or absent', (t) => {
  t.mock.method(console, 'warn', () => {});
  logger.warn('Deprecated route');
  logger.warn('Deprecated route', {});

  for (const call of console.warn.mock.calls) {
    assert.match(call.arguments[0], /\[WARN\] Deprecated route$/);
  }
});

test('routes each level to the matching console method', (t) => {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
  t.mock.method(console, 'error', () => {});

  logger.info('i');
  logger.warn('w');
  logger.error('e');

  assert.equal(console.log.mock.callCount(), 1);
  assert.equal(console.warn.mock.callCount(), 1);
  assert.equal(console.error.mock.callCount(), 1);
});

test('suppresses debug output in production', (t) => {
  const previousEnv = process.env.NODE_ENV;
  t.after(() => {
    process.env.NODE_ENV = previousEnv;
  });
  t.mock.method(console, 'debug', () => {});

  process.env.NODE_ENV = 'production';
  logger.debug('hidden');
  assert.equal(console.debug.mock.callCount(), 0);

  process.env.NODE_ENV = 'development';
  logger.debug('shown');
  assert.equal(console.debug.mock.callCount(), 1);
});
