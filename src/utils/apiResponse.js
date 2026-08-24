/**
 * Standardized API response helpers.
 * Provides consistent JSON response structure across all endpoints.
 *
 * Usage:
 *   const { success, error } = require('../utils/apiResponse');
 *   success(res, { user }, 201);
 *   error(res, 'Not found', 404);
 */

/**
 * Send a successful JSON response.
 * @param {Object} res - Express response object
 * @param {*} data - Response payload
 * @param {number} [statusCode=200] - HTTP status code
 */
const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Send an error JSON response.
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Array} [errors] - Optional array of detailed errors
 */
const error = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = { success, error };
