const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productSchemas } = require('../middleware/validationSchemas');

router.get('/', getProducts);
router.get('/categories/all', getCategories);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', protect, authorize('admin'), validate(productSchemas.create), createProduct);
router.put('/:id', protect, authorize('admin'), validate(productSchemas.update), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
