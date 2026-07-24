const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
      console.log('Database connection established successfully.');
      return;
    } catch (error) {
      console.error(`DB connection attempt ${i + 1}/${retries} failed:`, error.message);
      if (i === retries - 1) {
        console.error('All DB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

module.exports = { sequelize, connectDB };
