const express = require('express');
const { 
  sellerSignup, 
  sellerLogin, 
  getSellerProfile, 
  updateSellerProfile 
} = require('../controllers/sellerController');
const { 
  protectSeller
} = require('../middleware/sellerMiddleware');
const { 
  sellerSignupValidation, 
  sellerLoginValidation 
} = require('../utils/sellerValidation');

const router = express.Router();

// Public routes
router.post('/signup', sellerSignupValidation, sellerSignup);
router.post('/login', sellerLoginValidation, sellerLogin);

// Protected routes
router.get('/profile', protectSeller, getSellerProfile);
router.put('/profile', protectSeller, updateSellerProfile);




module.exports = router;