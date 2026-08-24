/**
 * Generic request body validation middleware.
 * Validates required fields, types, and string length constraints.
 *
 * @param {Object} schema - Validation schema definition
 * @param {string} schema[field].type - Expected type ('string', 'number', 'email')
 * @param {boolean} schema[field].required - Whether the field is required
 * @param {number} schema[field].minLength - Minimum string length
 * @param {number} schema[field].maxLength - Maximum string length
 * @param {number} schema[field].min - Minimum numeric value
 * @returns {Function} Express middleware
 *
 * @example
 * const validate = require('../middleware/validate');
 * router.post('/register', validate({
 *   email: { type: 'email', required: true },
 *   password: { type: 'string', required: true, minLength: 6 },
 *   firstName: { type: 'string', required: true, maxLength: 50 }
 * }), controller.register);
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip optional fields that are not present
      if (value === undefined || value === null) {
        continue;
      }

      // Type checks
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }

      if (rules.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
        errors.push(`${field} must be a valid number`);
        continue;
      }

      if (rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          errors.push(`${field} must be a valid email address`);
          continue;
        }
      }

      // String length constraints
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
      }

      // Numeric range constraints
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = validate;
