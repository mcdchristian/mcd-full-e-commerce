const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * Parse a value into a strictly positive integer.
 * @param {*} value - Raw value, usually a query string entry
 * @param {Number} fallback - Value used when parsing fails or yields <= 0
 * @returns {Number}
 */
const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Offset-based pagination helper
 * @param {Object} query - Express query object
 * @returns {Object} - limit and offset
 */
const getPagination = (query = {}) => {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const offset = (page - 1) * limit;

  return { limit, offset };
};

/**
 * Format paginated response
 * @param {Object} data - Result from findAndCountAll
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object}
 */
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_PAGE_SIZE);
  const totalPages = Math.ceil(totalItems / pageSize);

  return { totalItems, items, totalPages, currentPage };
};

module.exports = { getPagination, getPagingData, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };
