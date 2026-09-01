const logger = require('../utils/logger');

const GENERIC_MESSAGE = 'Something went wrong on the server';

const isDevelopment = () => process.env.NODE_ENV === 'development';

/**
 * Central Express error handler.
 *
 * A failure is only described to the client when we chose the wording
 * ourselves — an AppError, or any error carrying a 4xx status, such as the
 * body parser's malformed-JSON and payload-too-large errors. Everything else
 * is an unexpected fault: it is logged in full and answered with a generic
 * message, so driver output and schema details stay server side.
 *
 * The four-argument signature is what marks this as an error handler to Express.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  const canExposeMessage = (err.expose === true || isClientError) && Boolean(err.message);

  const details = {
    requestId: req.id,
    statusCode,
    message: err.message,
    stack: isDevelopment() ? err.stack : undefined
  };

  if (statusCode >= 500) {
    logger.error('Request failed', details);
  } else {
    logger.warn('Request rejected', details);
  }

  // Something already started writing the response; Express's default handler
  // is the only one that can close it cleanly from here.
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    message: canExposeMessage ? err.message : GENERIC_MESSAGE,
    requestId: req.id,
    ...(isDevelopment() && { stack: err.stack })
  });
};

module.exports = errorHandler;
module.exports.GENERIC_MESSAGE = GENERIC_MESSAGE;
