/**
 * Required environment variables, checked once at startup.
 *
 * The database entries matter as much as the rest: without them Sequelize
 * fails later with a driver-level message that names neither the missing
 * variable nor the file it belongs in.
 *
 * DB_PASS is absent on purpose — an empty password is valid on a local
 * install. DB_PORT is absent because the driver defaults it to 3306.
 */
const REQUIRED_ENV_VARS = [
  'DB_NAME',
  'DB_USER',
  'DB_HOST',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'APP_URL'
];

/**
 * List the required variables that are missing or blank.
 * @param {Object} env - Environment to inspect, usually process.env
 * @param {string[]} [required] - Names to require
 * @returns {string[]} Missing names, in the order they were declared
 */
const findMissingEnvVars = (env = {}, required = REQUIRED_ENV_VARS) =>
  required.filter((name) => {
    const value = env[name];
    return value === undefined || value === null || String(value).trim() === '';
  });

module.exports = { findMissingEnvVars, REQUIRED_ENV_VARS };
