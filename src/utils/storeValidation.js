const { body } = require('express-validator');

const storeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  
  body('category')
    .isIn(["Handmade Clothing", "Traditional Textiles", "Crochet & Knitting", "Jewelry & Accessories", "Bags & Purses", "Home Decor", "Kitchen & Dining", "Local Crafts", "Organic & Herbal", "Beauty & Care", "Food & Homemade Items", "Pet & Kids Items"
])
    .withMessage('Invalid store category'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Store description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('contactInfo.phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number'),
  
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
];

const storeUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  
  body('category')
    .optional()
    .isIn(["Handmade Clothing", "Traditional Textiles", "Crochet & Knitting", "Jewelry & Accessories", "Bags & Purses", "Home Decor", "Kitchen & Dining", "Local Crafts", "Organic & Herbal", "Beauty & Care", "Food & Homemade Items", "Pet & Kids Items"
])
    .withMessage('Invalid store category'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters')
];

module.exports = {
  storeValidation,
  storeUpdateValidation
};