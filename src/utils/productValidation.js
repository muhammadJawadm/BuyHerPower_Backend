const { body } = require('express-validator');

const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  
  body('sale_price')
    .optional()
    .isNumeric()
    .withMessage('Sale price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Sale price cannot be negative'),
  
  body('category')
    .isIn(['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other'])
    .withMessage('Invalid product category'),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('store_id')
    .isMongoId()
    .withMessage('Invalid store ID format')
];

const productUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  
  body('sale_price')
    .optional()
    .isNumeric()
    .withMessage('Sale price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Sale price cannot be negative'),
  
  body('category')
    .optional()
    .isIn(['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other'])
    .withMessage('Invalid product category'),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

module.exports = {
  productValidation,
  productUpdateValidation
};