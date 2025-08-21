const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrdersByUserId,
  getOrdersByStoreId,
  deleteOrder,
  getOrderStats
} = require('../controllers/orderController');

// Import middleware (uncomment and adjust paths as needed)
// const { protect, admin } = require('../middleware/authMiddleware');
// const { validateOrder } = require('../middleware/validationMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or Private if authentication required)
router.post('/', createOrder);

// @desc    Get all orders with pagination and filtering
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', getAllOrders);

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
router.get('/stats', getOrderStats);

// @desc    Get orders by user ID
// @route   GET /api/orders/user/:userId
// @access  Private
router.get('/user/:userId', getOrdersByUserId);

// @desc    Get orders by store ID
// @route   GET /api/orders/store/:storeId
// @access  Private
router.get('/store/:storeId', getOrdersByStoreId);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', getOrderById);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', updateOrderStatus);

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
router.put('/:id/payment', updatePaymentStatus);

// @desc    Cancel order (soft delete)
// @route   DELETE /api/orders/:id
// @access  Private
router.delete('/:id', deleteOrder);

module.exports = router;