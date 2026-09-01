const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const AppError = require('../utils/AppError');

// Sorting is driven by the query string, so both halves of the ORDER BY clause
// are matched against a fixed list instead of being forwarded to the driver.
const SORTABLE_FIELDS = ['createdAt', 'name', 'price', 'stock'];
const SORT_DIRECTIONS = ['ASC', 'DESC'];

const parsePositiveNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, search, categoryId, minPrice, maxPrice, sortBy, order } = req.query;
    const { limit: l, offset } = getPagination({ page, limit });

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const min = parsePositiveNumber(minPrice);
    const max = parsePositiveNumber(maxPrice);
    if (min !== null || max !== null) {
      where.price = {};
      if (min !== null) where.price[Op.gte] = min;
      if (max !== null) where.price[Op.lte] = max;
    }

    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const requestedOrder = String(order || '').toUpperCase();
    const sortOrder = SORT_DIRECTIONS.includes(requestedOrder) ? requestedOrder : 'DESC';

    const data = await Product.findAndCountAll({
      where,
      limit: l,
      offset,
      order: [[sortField, sortOrder]],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }]
    });

    const response = getPagingData(data, page, l);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
