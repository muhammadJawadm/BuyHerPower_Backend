const { validationResult } = require('express-validator');
const Store = require('../models/Store');
const Seller = require('../models/Seller');

// @desc    Create a new store
// @route   POST /api/stores
// @access  Private (Seller only)
const createStore = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      name, 
      category, 
      description, 
      banner, 
      logo, 
      contactInfo, 
      socialLinks 
    } = req.body;

    // Check if seller exists
    const seller = await Seller.findById(req.seller.sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Check if store name already exists
    const existingStore = await Store.findOne({ name });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'Store name already exists'
      });
    }

    // Create store
    const store = await Store.create({
      name,
      category,
      description,
      banner,
      logo,
      seller_id: req.seller.sellerId,
      contactInfo,
      socialLinks
    });

    await store.populate('seller_id', 'name email businessName');

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      store
    });

  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getAllStores = async (req, res) => {
  try {
    const {  category, search  } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    // if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch stores from database
    const Store = require('../models/Store');
    const stores = await Store.find(filter);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully',
      stores,
    //   pagination: {
        // current_page: pageNum,
        // total_pages: Math.ceil(total / limitNum),
        // total_stores: total,
        // stores_per_page: limitNum
    //   }
    });

  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Public
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id)
      .populate('seller_id', 'name email businessName phone');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store retrieved successfully',
      store
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format'
      });
    }

    console.error('Get store by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get stores by seller
// @route   GET /api/stores/seller/my-stores
// @access  Private (Seller only)
const getMyStores = async (req, res) => {
  try {
    const stores = await Store.find({ seller_id: req.seller.sellerId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Seller stores retrieved successfully',
      count: stores.length,
      stores
    });

  } catch (error) {
    console.error('Get my stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (Store owner only)
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if store exists and belongs to seller
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    if (store.seller_id.toString() !== req.seller.sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this store'
      });
    }

    const allowedUpdates = ['name', 'category', 'description', 'banner', 'logo',  'contactInfo', 'socialLinks'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedStore = await Store.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller_id', 'name email businessName');

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      store: updatedStore
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format'
      });
    }

    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (Store owner only)
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    if (store.seller_id.toString() !== req.seller.sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this store'
      });
    }

    await Store.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format'
      });
    }

    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createStore,
  getAllStores,
  getStoreById,
  getMyStores,
  updateStore,
  deleteStore
};