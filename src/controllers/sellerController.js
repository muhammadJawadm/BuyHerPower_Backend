const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Seller = require('../models/Seller');

// Generate JWT Token
const generateToken = (sellerId) => {
  return jwt.sign({ sellerId, userType: 'seller' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register seller
// @route   POST /api/seller/signup
// @access  Public
const sellerSignup = async (req, res) => {
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
      email, 
      password, 
      phone, 
    } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'Seller already exists with this email'
      });
    }

    // Create seller
    const seller = await Seller.create({
      name,
      email,
      password,
      phone,
    });

    // Generate token
    const token = generateToken(seller._id);

    res.status(201).json({
      success: true,
      message: 'Seller registered successfully',
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        }
    });

  } catch (error) {
    console.error('Seller signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Login seller
// @route   POST /api/seller/login
// @access  Public
const sellerLogin = async (req, res) => {
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

    const { email, password } = req.body;

    // Check if seller exists
    const seller = await Seller.findOne({ email }).select('+password');
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if seller is active
    

    // Check password
    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(seller._id);

    res.status(200).json({
      success: true,
      message: 'Seller login successful',
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        }
    });

  } catch (error) {
    console.error('Seller login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get current seller profile
// @route   GET /api/seller/profile
// @access  Private
const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.sellerId);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
         phone: seller.phone,
        createdAt: seller.createdAt
      }
    });

  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update seller profile
// @route   PUT /api/seller/profile
// @access  Private
const updateSellerProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone'];
    const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const seller = await Seller.findByIdAndUpdate(
      req.seller.sellerId,
      updates,
      { new: true, runValidators: true }
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        }
    });

  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  sellerSignup,
  sellerLogin,
  getSellerProfile,
  updateSellerProfile
};