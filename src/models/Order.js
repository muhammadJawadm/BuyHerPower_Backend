const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow guest orders
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    }
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name is required']
    },
    addressLine: {
      type: String,
      required: [true, 'Address line is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Pakistan'
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    }
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Credit Card', 'PayPal', 'Stripe', 'Bank Transfer'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  itemsPrice: {
    type: Number,
    required: true
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending'
  },
  trackingNumber: {
    type: String,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Create indexes for better performance
orderSchema.index({ user_id: 1 });
orderSchema.index({ 'products.store_id': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);