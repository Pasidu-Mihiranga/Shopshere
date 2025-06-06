// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // ✅ ADD THIS LINE
const User = mongoose.model('User');
const Shop = mongoose.model('Shop');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Shop owner middleware
exports.isShopOwner = async (req, res, next) => {
  try {
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Verify shop ownership
    const shop = await Shop.findOne({ ownerId: req.user._id });
    
    if (!shop) {
      return res.status(403).json({ message: 'No shop associated with this account' });
    }
    
    // Add shop to request
    req.shop = shop;
    
    next();
  } catch (error) {
    console.error('Shop owner middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};