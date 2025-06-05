// server/routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get shop info for current user
router.get('/info', async (req, res) => {
  try {
    console.log('🏪 Fetching shop info for user:', req.user._id);
    
    let shop = await Shop.findOne({ ownerId: req.user._id });
    
    if (!shop) {
      console.log('🏪 No shop found, creating default shop...');
      // Create a basic shop if it doesn't exist
      shop = new Shop({
        ownerId: req.user._id,
        shopName: `${req.user.firstName || 'User'}'s Shop`,
        contact: {
          email: req.user.email,
          phone: req.user.phoneNumber || ''
        },
        description: 'Welcome to my shop!',
        isActive: true,
        totalProducts: 0
      });
      
      await shop.save();
      console.log('✅ Default shop created:', shop._id);
    }

    res.json({
      success: true,
      shop: shop
    });
    
  } catch (error) {
    console.error('❌ Error fetching shop info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop information',
      shop: null
    });
  }
});

// Update shop info
router.put('/info', async (req, res) => {
  try {
    const { shopName, description, contact, address, businessInfo } = req.body;
    
    let shop = await Shop.findOne({ ownerId: req.user._id });
    
    if (!shop) {
      // Create new shop
      shop = new Shop({
        ownerId: req.user._id,
        shopName: shopName || `${req.user.firstName || 'User'}'s Shop`,
        contact: contact || { email: req.user.email },
        description: description || 'Welcome to my shop!',
        address: address || {},
        businessInfo: businessInfo || {},
        isActive: true
      });
    } else {
      // Update existing shop
      if (shopName) shop.shopName = shopName;
      if (description) shop.description = description;
      if (contact) shop.contact = { ...shop.contact, ...contact };
      if (address) shop.address = { ...shop.address, ...address };
      if (businessInfo) shop.businessInfo = { ...shop.businessInfo, ...businessInfo };
      shop.updatedAt = new Date();
    }
    
    await shop.save();
    
    res.json({
      success: true,
      message: 'Shop updated successfully',
      shop: shop
    });
    
  } catch (error) {
    console.error('❌ Error updating shop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop information'
    });
  }
});

// Get shop statistics
router.get('/stats', async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // You can add more statistics here
    const stats = {
      totalProducts: shop.totalProducts || 0,
      shopRating: shop.rating || 0,
      isVerified: shop.isVerified || false,
      isActive: shop.isActive || false,
      memberSince: shop.createdAt
    };

    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching shop stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop statistics'
    });
  }
});

module.exports = router;