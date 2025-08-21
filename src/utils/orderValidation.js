const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Pakistani format)
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

// Validate postal code (Pakistani format)
const isValidPostalCode = (postalCode) => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

// Validate order creation data
const validateCreateOrder = (orderData) => {
  const errors = [];
  const { products, shippingAddress, paymentMethod, user_id } = orderData;

  // Validate user_id if provided
  if (user_id && !isValidObjectId(user_id)) {
    errors.push('Invalid user ID format');
  }

  // Validate products array
  if (!products || !Array.isArray(products) || products.length === 0) {
    errors.push('Products array is required and cannot be empty');
  } else {
    products.forEach((product, index) => {
      // Validate product ID
      if (!product.product || !isValidObjectId(product.product)) {
        errors.push(`Product ${index + 1}: Invalid product ID format`);
      }

      // Validate quantity
      if (!product.quantity || typeof product.quantity !== 'number' || product.quantity < 1) {
        errors.push(`Product ${index + 1}: Quantity must be a positive number`);
      }

      if (product.quantity > 100) {
        errors.push(`Product ${index + 1}: Quantity cannot exceed 100 items`);
      }

      // Validate price
      if (product.price !== undefined) {
        if (typeof product.price !== 'number' || product.price < 0) {
          errors.push(`Product ${index + 1}: Price must be a positive number`);
        }
        if (product.price > 1000000) {
          errors.push(`Product ${index + 1}: Price cannot exceed 1,000,000`);
        }
      }

      // Validate store_id if provided
      if (product.store_id && !isValidObjectId(product.store_id)) {
        errors.push(`Product ${index + 1}: Invalid store ID format`);
      }
    });
  }

  // Validate shipping address
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address is required');
  } else {
    const { fullName, addressLine, city, postalCode, country, phone } = shippingAddress;

    // Full name validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.push('Full name is required and must be at least 2 characters');
    }
    if (fullName && fullName.length > 100) {
      errors.push('Full name cannot exceed 100 characters');
    }

    // Address line validation
    if (!addressLine || typeof addressLine !== 'string' || addressLine.trim().length < 5) {
      errors.push('Address line is required and must be at least 5 characters');
    }
    if (addressLine && addressLine.length > 200) {
      errors.push('Address line cannot exceed 200 characters');
    }

    // City validation
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      errors.push('City is required and must be at least 2 characters');
    }
    if (city && city.length > 50) {
      errors.push('City name cannot exceed 50 characters');
    }

    // Postal code validation
    if (!postalCode || typeof postalCode !== 'string') {
      errors.push('Postal code is required');
    } else if (!isValidPostalCode(postalCode)) {
      errors.push('Invalid postal code format (must be 5 digits)');
    }

    // Country validation
    if (country && typeof country !== 'string') {
      errors.push('Country must be a string');
    }
    if (country && country.length > 50) {
      errors.push('Country name cannot exceed 50 characters');
    }

    // Phone validation
    if (!phone || typeof phone !== 'string') {
      errors.push('Phone number is required');
    } else if (!isValidPhone(phone)) {
      errors.push('Invalid phone number format');
    }
  }

  // Validate payment method
  const validPaymentMethods = ['Cash on Delivery', 'Credit Card', 'PayPal', 'Stripe', 'Bank Transfer'];
  if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
    errors.push('Invalid payment method');
  }

  // Validate notes if provided
  if (orderData.notes && typeof orderData.notes !== 'string') {
    errors.push('Notes must be a string');
  }
  if (orderData.notes && orderData.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate order status update
const validateOrderStatusUpdate = (statusData) => {
  const errors = [];
  const { orderStatus, trackingNumber } = statusData;

  const validOrderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  
  // Validate order status
  if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
    errors.push('Invalid order status');
  }

  // Validate tracking number format
  if (trackingNumber) {
    if (typeof trackingNumber !== 'string') {
      errors.push('Tracking number must be a string');
    } else if (trackingNumber.length < 5 || trackingNumber.length > 50) {
      errors.push('Tracking number must be between 5 and 50 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate payment status update
const validatePaymentStatusUpdate = (paymentData) => {
  const errors = [];
  const { paymentStatus } = paymentData;

  const validPaymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
  
  if (!paymentStatus) {
    errors.push('Payment status is required');
  } else if (!validPaymentStatuses.includes(paymentStatus)) {
    errors.push('Invalid payment status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate pagination parameters
const validatePagination = (query) => {
  const errors = [];
  const { page, limit } = query;

  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive number');
    }
    if (pageNum > 1000) {
      errors.push('Page number cannot exceed 1000');
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1) {
      errors.push('Limit must be a positive number');
    }
    if (limitNum > 100) {
      errors.push('Limit cannot exceed 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate order filters
const validateOrderFilters = (query) => {
  const errors = [];
  const { status, paymentStatus, user_id } = query;

  const validOrderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  const validPaymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];

  // Validate status filter
  if (status && !validOrderStatuses.includes(status)) {
    errors.push('Invalid order status filter');
  }

  // Validate payment status filter
  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    errors.push('Invalid payment status filter');
  }

  // Validate user_id filter
  if (user_id && !isValidObjectId(user_id)) {
    errors.push('Invalid user ID format in filter');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate order ID parameter
const validateOrderId = (orderId) => {
  const errors = [];

  if (!orderId) {
    errors.push('Order ID is required');
  } else if (!isValidObjectId(orderId)) {
    errors.push('Invalid order ID format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate user ID parameter
const validateUserId = (userId) => {
  const errors = [];

  if (!userId) {
    errors.push('User ID is required');
  } else if (!isValidObjectId(userId)) {
    errors.push('Invalid user ID format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate store ID parameter
const validateStoreId = (storeId) => {
  const errors = [];

  if (!storeId) {
    errors.push('Store ID is required');
  } else if (!isValidObjectId(storeId)) {
    errors.push('Invalid store ID format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate order status transition
const validateOrderStatusTransition = (currentStatus, newStatus) => {
  const errors = [];
  
  const statusFlow = {
    'Pending': ['Processing', 'Cancelled'],
    'Processing': ['Shipped', 'Cancelled'],
    'Shipped': ['Delivered', 'Returned'],
    'Delivered': ['Returned'],
    'Cancelled': [],
    'Returned': []
  };

  if (!statusFlow[currentStatus]) {
    errors.push('Invalid current order status');
  } else if (!statusFlow[currentStatus].includes(newStatus)) {
    errors.push(`Cannot change status from ${currentStatus} to ${newStatus}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize input data
const sanitizeOrderData = (orderData) => {
  const sanitized = { ...orderData };

  // Sanitize shipping address
  if (sanitized.shippingAddress) {
    Object.keys(sanitized.shippingAddress).forEach(key => {
      if (typeof sanitized.shippingAddress[key] === 'string') {
        sanitized.shippingAddress[key] = sanitized.shippingAddress[key].trim();
      }
    });
  }

  // Sanitize notes
  if (sanitized.notes) {
    sanitized.notes = sanitized.notes.trim();
  }

  return sanitized;
};

// Custom validation middleware
const createOrderValidationMiddleware = (req, res, next) => {
  const sanitizedData = sanitizeOrderData(req.body);
  const validation = validateCreateOrder(sanitizedData);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  req.body = sanitizedData;
  next();
};

const orderStatusValidationMiddleware = (req, res, next) => {
  const validation = validateOrderStatusUpdate(req.body);
  const orderIdValidation = validateOrderId(req.params.id);

  const allErrors = [...validation.errors, ...orderIdValidation.errors];

  if (allErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: allErrors
    });
  }

  next();
};

const paymentStatusValidationMiddleware = (req, res, next) => {
  const validation = validatePaymentStatusUpdate(req.body);
  const orderIdValidation = validateOrderId(req.params.id);

  const allErrors = [...validation.errors, ...orderIdValidation.errors];

  if (allErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: allErrors
    });
  }

  next();
};

module.exports = {
  // Validation functions
  validateCreateOrder,
  validateOrderStatusUpdate,
  validatePaymentStatusUpdate,
  validatePagination,
  validateOrderFilters,
  validateOrderId,
  validateUserId,
  validateStoreId,
  validateOrderStatusTransition,
  
  // Utility functions
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  sanitizeOrderData,
  
  // Middleware functions
  createOrderValidationMiddleware,
  orderStatusValidationMiddleware,
  paymentStatusValidationMiddleware
};