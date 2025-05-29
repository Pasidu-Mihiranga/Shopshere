const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['customer', 'shop_owner'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  profileImage: String,
  phoneNumber: String,
  addresses: [{
    addressType: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: Boolean
  }],
  authProvider: {
    type: {
      type: String,
      enum: ['local', 'google', 'facebook', 'apple'],
      default: 'local'
    },
    providerId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);