/**
 * Copy only the listed keys out of a request body.
 *
 * Handing `req.body` straight to a Sequelize `create` or `update` lets the
 * caller write any column the model declares, including the primary key. This
 * keeps writes to an explicit allowlist.
 *
 * Keys absent from the body are left out entirely, so an update only touches
 * what was actually sent.
 *
 * @param {Object} body - Request body
 * @param {string[]} allowed - Field names the caller may write
 * @returns {Object} A new object holding only the permitted, present keys
 */
const pickFields = (body, allowed) => {
  const picked = {};

  if (!body || typeof body !== 'object') {
    return picked;
  }

  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== undefined) {
      picked[field] = body[field];
    }
  }

  return picked;
};

module.exports = pickFields;
