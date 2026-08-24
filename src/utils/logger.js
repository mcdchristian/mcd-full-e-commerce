/**
 * Structured logger utility for consistent application logging.
 * Provides leveled logging with timestamps and contextual metadata.
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started', { port: 3000 });
 *   logger.error('Connection failed', { error: err.message });
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Format a log entry as a structured string.
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [meta] - Optional metadata
 * @returns {string}
 */
const formatLogEntry = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;

  if (meta && Object.keys(meta).length > 0) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
};

const logger = {
  info(message, meta) {
    console.log(formatLogEntry(LOG_LEVELS.INFO, message, meta));
  },

  warn(message, meta) {
    console.warn(formatLogEntry(LOG_LEVELS.WARN, message, meta));
  },

  error(message, meta) {
    console.error(formatLogEntry(LOG_LEVELS.ERROR, message, meta));
  },

  debug(message, meta) {
    if (!isProduction()) {
      console.debug(formatLogEntry(LOG_LEVELS.DEBUG, message, meta));
    }
  }
};

module.exports = logger;
