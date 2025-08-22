const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Store = require('../models/Store');

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res) => {
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
      description, 
      price, 
      sale_price, 
      category, 
      images, 
      quantity, 
      store_id, 
      saleEndingDate 
    } = req.body;

    // Check if store exists
    const store = await Store.findById(store_id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

   

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      sale_price,
      category,
      images,
      quantity,
      store_id,
      saleEndingDate
    });

    await product.populate('store_id', 'name category');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { category, search, store_id, page = 1, limit = 30 } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (store_id) filter.store_id = store_id;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch products from database
    const products = await Product.find(filter)
      .populate('store_id', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      products,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_products: total,
        products_per_page: limitNum
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('store_id', 'name category description contactInfo');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      product
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get products by store
// @route   GET /api/products/store/:storeId
// @access  Public
const getProductsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { category, search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { store_id: storeId };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('store_id', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Store products retrieved successfully',
      products,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_products: total,
        products_per_page: limitNum
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format'
      });
    }

    console.error('Get products by store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get seller's products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller only)
const getMyProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    // First get all stores belonging to the seller
    const sellerStores = await Store.find({ seller_id: req.seller.sellerId }).select('_id');
    const storeIds = sellerStores.map(store => store._id);

    // Build filter
    const filter = { store_id: { $in: storeIds } };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('store_id', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Seller products retrieved successfully',
      products,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_products: total,
        products_per_page: limitNum
      }
    });

  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Product owner only)
const updateProduct = async (req, res) => {
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

    // Check if product exists and belongs to seller's store
    const product = await Product.findById(id).populate('store_id');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.store_id.seller_id.toString() !== req.seller.sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const allowedUpdates = ['name', 'description', 'price', 'sale_price', 'category', 'images', 'quantity', 'saleEndingDate'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('store_id', 'name category');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Product owner only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('store_id');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.store_id.seller_id.toString() !== req.seller.sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByStore,
  getMyProducts,
  updateProduct,
  deleteProduct
};