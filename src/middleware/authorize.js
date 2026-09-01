const AppError = require('../utils/AppError');

/**
 * Restrict a route to a set of roles.
 *
 * Must be mounted after `protect`, which is what populates `req.user`. If it
 * is not, the request is refused as unauthenticated rather than crashing on a
 * missing user — mounting the two in the wrong order should not turn every
 * call into a 500.
 *
 * @param {...string} roles - Roles allowed through
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post('/', protect, authorize('admin'), createProduct);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Not authorized, no token'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(`User role ${req.user.role} is not authorized to access this route`)
      );
    }

    next();
  };
};

module.exports = authorize;
