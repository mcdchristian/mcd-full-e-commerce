/**
 * Minimal Express request/response doubles for unit testing middleware and
 * helpers without booting the server or touching the database.
 */

/**
 * Build a response double that records the status code and JSON payload.
 * @returns {Object} res double exposing `statusCode`, `body` and `jsonCalled`
 */
const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  jsonCalled: false,

  status(code) {
    this.statusCode = code;
    return this;
  },

  json(payload) {
    this.body = payload;
    this.jsonCalled = true;
    return this;
  }
});

/**
 * Run a synchronous Express middleware against a request body.
 * @param {Function} middleware - Middleware to invoke
 * @param {Object} req - Request double
 * @returns {Object} `{ res, nextCalled, nextError }`
 */
const runMiddleware = (middleware, req) => {
  const res = createResponse();
  let nextCalled = false;
  let nextError;

  middleware(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  return { res, nextCalled, nextError };
};

module.exports = { createResponse, runMiddleware };
