/**
 * Validation schemas for all API routes.
 * Used with the validate middleware to enforce input constraints.
 */

const authSchemas = {
  register: {
    firstName: { type: 'string', required: true, maxLength: 50 },
    lastName: { type: 'string', required: true, maxLength: 50 },
    email: { type: 'email', required: true },
    password: { type: 'string', required: true, minLength: 6, maxLength: 128 }
  },
  login: {
    email: { type: 'email', required: true },
    password: { type: 'string', required: true, minLength: 1 }
  }
};

const productSchemas = {
  create: {
    name: { type: 'string', required: true, maxLength: 255 },
    description: { type: 'string', required: true },
    price: { type: 'number', required: true, min: 0 },
    stock: { type: 'number', required: false, min: 0 },
    categoryId: { type: 'number', required: true }
  },
  update: {
    name: { type: 'string', required: false, maxLength: 255 },
    description: { type: 'string', required: false },
    price: { type: 'number', required: false, min: 0 },
    stock: { type: 'number', required: false, min: 0 }
  }
};

const cartSchemas = {
  addItem: {
    productId: { type: 'string', required: true },
    quantity: { type: 'number', required: false, min: 1 }
  },
  updateItem: {
    quantity: { type: 'number', required: true, min: 1 }
  }
};

const orderSchemas = {
  create: {
    shippingAddress: { type: 'string', required: true, minLength: 5, maxLength: 500 }
  },
  checkout: {
    items: { required: true }
  },
  updateStatus: {
    status: { type: 'string', required: true, maxLength: 20 }
  }
};

module.exports = {
  authSchemas,
  productSchemas,
  cartSchemas,
  orderSchemas
};
