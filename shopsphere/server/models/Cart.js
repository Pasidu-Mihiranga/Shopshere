const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    shopId: {
      type: String,  // ✅ KEEP THIS AS STRING
      required: true
    },
    name: String,
    price: Number,
    image: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);