const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

// Sorting is driven by the query string, so both halves of the ORDER BY clause
// are matched against a fixed list instead of being forwarded to the driver.
const SORTABLE_FIELDS = ['createdAt', 'name', 'price', 'stock'];
const SORT_DIRECTIONS = ['ASC', 'DESC'];

const parsePositiveNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

exports.getProducts = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
