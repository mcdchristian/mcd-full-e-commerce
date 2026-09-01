const jwt = require('jsonwebtoken');
const { User, Cart } = require('../models');
const AppError = require('../utils/AppError');

const DEFAULT_TOKEN_TTL = '7d';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // jsonwebtoken rejects an `expiresIn` of undefined, so never pass one.
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_TOKEN_TTL
  });
};

// The User model lowercases and trims on write; lookups have to match.
const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const toAuthPayload = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  token: generateToken(user.id)
});

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, password } = req.body;
    const email = normalizeEmail(req.body.email);

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw AppError.conflict('User already exists');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'customer'
    });

    // Create a cart for the user
    await Cart.create({ userId: user.id });

    res.status(201).json(toAuthPayload(user));
  } catch (error) {
    // Two concurrent signups for the same address both pass the check above;
    // the unique index settles it, and that is a conflict, not a server fault.
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(AppError.conflict('User already exists'));
    }
    if (error.name === 'SequelizeValidationError') {
      return next(AppError.badRequest(error.errors.map((e) => e.message).join(', ')));
    }

    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw AppError.unauthorized('Email ou mot de passe incorrect');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Email ou mot de passe incorrect');
    }

    res.json(toAuthPayload(user));
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
