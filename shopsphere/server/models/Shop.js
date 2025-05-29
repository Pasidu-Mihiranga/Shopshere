const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  businessInfo: {
    registrationNumber: String,
    taxId: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

module.exports = mongoose.model('Shop', ShopSchema);