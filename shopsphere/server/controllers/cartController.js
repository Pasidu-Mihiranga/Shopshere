// server/controllers/cartController.js
const Cart = require('../models/Cart');
const mongoose = require('mongoose');

// Get Shop model that's already compiled in app.js
const Shop = mongoose.model('Shop');

// Get user cart
exports.getCart = async (req, res) => {
  console.log('✅ Get cart controller accessed');
  
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [],
        totalAmount: 0
      });
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      items: cart.items,
      totalAmount: cart.totalAmount,
      totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
    });
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// Add item to cart
exports.addItem = async (req, res) => {
  console.log('✅ Add to cart controller accessed');
  console.log('Cart item data:', req.body);
  
  try {
    const { productId, shopId, quantity, attributes, name, price, image } = req.body;
    
    // Validate required fields
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }
    
    // Find the product to get current details if not provided
    let productDetails = { name, price, image };
    
    if (!name || !price) {
      const shop = await Shop.findById(shopId);
      if (shop) {
        const product = shop.products.id(productId);
        if (product) {
          productDetails = {
            name: product.name,
            price: product.salePrice || product.price,
            image: product.images[0] || ''
          };
        }
      }
    }
    
    if (!productDetails.name) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [],
        totalAmount: 0
      });
    }
    
    // Check if item already exists with same attributes
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === productId && 
      JSON.stringify(item.attributes) === JSON.stringify(attributes || {})
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item
      const newItem = {
        productId,
        shopId,
        name: productDetails.name,
        price: productDetails.price,
        image: productDetails.image,
        quantity: parseInt(quantity),
        attributes: attributes || {}
      };
      cart.items.push(newItem);
    }
    
    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Update item quantity
exports.updateItem = async (req, res) => {
  console.log('✅ Update cart item controller accessed');
  
  try {
    const { productId } = req.params;
    const { quantity, attributes } = req.body;
    
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.productId === productId && 
      JSON.stringify(item.attributes) === JSON.stringify(attributes || {})
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = parseInt(quantity);
    }
    
    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
    
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
  console.log('✅ Remove cart item controller accessed');
  
  try {
    const { productId } = req.params;
    const { attributes } = req.body;
    
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(item => 
      !(item.productId === productId && 
        JSON.stringify(item.attributes) === JSON.stringify(attributes || {}))
    );
    
    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
    
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  console.log('✅ Clear cart controller accessed');
  
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [], totalAmount: 0 },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        totalAmount: 0,
        totalItems: 0
      }
    });
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Apply discount
exports.applyDiscount = async (req, res) => {
  console.log('✅ Apply discount controller accessed');
  
  try {
    const { code } = req.body;
    
    // Simple discount logic - you can expand this
    const discountCodes = {
      'SAVE10': { type: 'percentage', value: 10 },
      'SAVE20': { type: 'percentage', value: 20 },
      'FLAT5': { type: 'fixed', value: 5 }
    };
    
    const discount = discountCodes[code.toUpperCase()];
    
    if (!discount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount code'
      });
    }
    
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (cart.totalAmount * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }
    
    // Don't let discount exceed total amount
    discountAmount = Math.min(discountAmount, cart.totalAmount);
    
    res.status(200).json({
      success: true,
      message: 'Discount applied successfully',
      discount: {
        code: code.toUpperCase(),
        amount: discountAmount,
        type: discount.type,
        value: discount.value
      },
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        discountAmount: discountAmount,
        finalAmount: cart.totalAmount - discountAmount,
        totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
    
  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply discount',
      error: error.message
    });
  }
};