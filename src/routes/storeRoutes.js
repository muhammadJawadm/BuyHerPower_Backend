const express = require('express');
const {
  createStore,
  getAllStores,
  getStoreById,
  getMyStores,
  updateStore,
  deleteStore
} = require('../controllers/storeController');
const { protectSeller } = require('../middleware/sellerMiddleware');
const { storeValidation, storeUpdateValidation } = require('../utils/storeValidation');

const router = express.Router();

// Public routes
router.get('/', getAllStores);
router.get('/:id', getStoreById);

// Protected routes (Seller only)
router.post('/', protectSeller, storeValidation, createStore);
router.get('/seller/my-stores', protectSeller, getMyStores);
router.put('/:id', protectSeller, storeUpdateValidation, updateStore);
router.delete('/:id', protectSeller, deleteStore);

module.exports = router;