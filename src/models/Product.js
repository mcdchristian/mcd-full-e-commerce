const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  indexes: [
    // Index for search by name
    {
      fields: ['name']
    },
    // Index for filtering by category
    {
      fields: ['category_id']
    },
    // Composite index for common filtering + sorting
    {
      fields: ['category_id', 'price']
    }
  ]
});

module.exports = Product;
