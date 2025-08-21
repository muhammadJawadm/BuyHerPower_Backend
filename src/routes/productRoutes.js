const express = require('express');
const { 
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByStore,
  getMyProducts,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { 
  protectSeller
} = require('../middleware/sellerMiddleware');
const { 
  productValidation,
  productUpdateValidation
} = require('../utils/productValidation');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/store/:storeId', getProductsByStore);
router.post('/', productValidation, createProduct); // Made public, no token required

// Protected routes (Seller only)
router.get('/seller/my-products', protectSeller, getMyProducts);
router.put('/:id', protectSeller, productUpdateValidation, updateProduct);
router.delete('/:id', protectSeller, deleteProduct);

module.exports = router;