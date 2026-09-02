const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../utils/logger');

// Passing console.log to Sequelize prints the statement *and* the full internal
// options object — around a hundred lines per query, which buries the SQL and
// every other log line with it. Keep the statement, drop the rest.
const logQuery = (sql) => logger.debug(sql.replace(/^Executing \(\w+\): /, ''));

// On in development, off in production, and DB_LOGGING overrides either way.
const isSqlLoggingEnabled = () => {
  if (process.env.DB_LOGGING) return process.env.DB_LOGGING === 'true';
  return process.env.NODE_ENV === 'development';
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: isSqlLoggingEnabled() ? logQuery : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');
      return;
    } catch (error) {
      logger.error(`DB connection attempt ${i + 1}/${retries} failed`, { error: error.message });
      if (i === retries - 1) {
        logger.error('All DB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

module.exports = { sequelize, connectDB };
