const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const authorize = require('./authorize');

const BEARER_PREFIX = 'Bearer ';

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    // Note the trailing space: 'Bearer' alone would also match 'Bearertoken'.
    const token = header && header.startsWith(BEARER_PREFIX)
      ? header.slice(BEARER_PREFIX.length).trim()
      : null;

    if (!token) {
      throw AppError.unauthorized('Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!req.user) {
      throw AppError.unauthorized('User no longer exists');
    }

    next();
  } catch (error) {
    // An expired or forged token is a rejected request, not a server fault.
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Not authorized, token failed'));
    }

    next(error);
  }
};

module.exports = { protect, authorize };
