const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters'],
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Store category is required'],
    enum: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Store description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  banner: {
    type: String,
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  contactInfo: {
      phone: String,
    email: String
  },
  socialLinks: {
  website: String,
  facebook: String,
    instagram: String,
    twitter: String
  },}, {
  timestamps: true
});

// Create indexes for better performance
storeSchema.index({ seller_id: 1 });
storeSchema.index({ name: 1 });
storeSchema.index({ category: 1 });

module.exports = mongoose.model('Store', storeSchema);