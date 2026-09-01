/**
 * An error that carries an HTTP status and a message safe to show a client.
 *
 * Controllers throw these for expected failures (missing resource, bad input,
 * denied access). Anything else that reaches the error handler is treated as
 * unexpected and reported as a generic 500, so internal details — Sequelize
 * messages, column names, driver errors — never reach the response body.
 *
 * Usage:
 *   throw AppError.notFound('Product not found');
 */
class AppError extends Error {
  /**
   * @param {string} message - Message safe to send to the client
   * @param {number} [statusCode=500] - HTTP status to answer with
   */
  constructor(message, statusCode = 500) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    // Marks the message as safe to expose; the error handler checks this.
    this.expose = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Not authorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Not found') {
    return new AppError(message, 404);
  }

  static conflict(message) {
    return new AppError(message, 409);
  }
}

module.exports = AppError;
