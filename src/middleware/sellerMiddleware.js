const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');

const protectSeller = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
   
      
      // Check if seller still exists
      const seller = await Seller.findById(decoded.sellerId);
      if (!seller) {
        return res.status(401).json({
          success: false,
          message: 'Token is no longer valid'
        });
      }

      // Check if seller is active
     

      // Add seller to request
      req.seller = decoded;
      next();

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }

  } catch (error) {
    console.error('Seller auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Role-based access control for sellers

// Check if seller is verified

module.exports = {
  protectSeller,
};