const test = require('node:test');
const assert = require('node:assert/strict');

const { findMissingEnvVars, REQUIRED_ENV_VARS } = require('../../src/utils/validateEnv');

const completeEnv = () =>
  Object.fromEntries(REQUIRED_ENV_VARS.map((name) => [name, `value-for-${name}`]));

test('reports nothing when every required variable is set', () => {
  assert.deepEqual(findMissingEnvVars(completeEnv()), []);
});

test('reports a variable that is absent', () => {
  const env = completeEnv();
  delete env.JWT_SECRET;

  assert.deepEqual(findMissingEnvVars(env), ['JWT_SECRET']);
});

test('treats an empty or whitespace-only value as missing', () => {
  for (const blank of ['', '   ', '\t']) {
    const env = { ...completeEnv(), DB_NAME: blank };
    assert.deepEqual(findMissingEnvVars(env), ['DB_NAME'], `accepted ${JSON.stringify(blank)}`);
  }
});

test('reports every missing name, in declaration order', () => {
  const env = completeEnv();
  delete env.APP_URL;
  delete env.DB_NAME;

  assert.deepEqual(findMissingEnvVars(env), ['DB_NAME', 'APP_URL']);
});

test('covers the database connection settings', () => {
  for (const name of ['DB_NAME', 'DB_USER', 'DB_HOST']) {
    assert.ok(REQUIRED_ENV_VARS.includes(name), `${name} is not required`);
  }
});

test('does not require a password or a port', () => {
  // An empty password is valid locally, and the driver defaults the port.
  assert.ok(!REQUIRED_ENV_VARS.includes('DB_PASS'));
  assert.ok(!REQUIRED_ENV_VARS.includes('DB_PORT'));
});

test('an empty environment is entirely missing', () => {
  assert.deepEqual(findMissingEnvVars({}), REQUIRED_ENV_VARS);
});
