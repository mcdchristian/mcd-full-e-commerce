/**
 * Offset-based pagination helper
 * @param {Object} query - Express query object
 * @returns {Object} - limit and offset
 */
const getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const size = parseInt(query.limit) || 10;
  
  const limit = size > 100 ? 100 : size; // Max 100 items per page
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
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, items, totalPages, currentPage };
};

module.exports = { getPagination, getPagingData };
