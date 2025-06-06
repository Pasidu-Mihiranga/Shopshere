// src/contexts/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch cart from API when user is logged in
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (user) {
          console.log('📱 User logged in, fetching cart from server...');
          const response = await axios.get('/api/cart');
          setCart({
            items: response.data.items || [],
            totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
            totalAmount: response.data.totalAmount || 0
          });
        } else {
          console.log('👤 User not logged in, clearing cart state...');
          // Clear cart when user logs out
          setCart({
            items: [],
            totalItems: 0,
            totalAmount: 0
          });
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]); // Re-run when user login state changes

  // Add item to cart - ONLY if logged in
  const addToCart = async (product, quantity, attributes = {}) => {
    try {
      // Check if user is logged in
      if (!user) {
        // Show login required message
        alert('Please log in to add items to your cart');
        return { success: false, message: 'Login required' };
      }

      console.log('🛒 Adding to cart:', { product: product.name, quantity });
      
      const item = {
        productId: product._id,
        shopId: product.shopId || 'default-shop',
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images?.[0] || '',
        attributes,
        quantity
      };

      // Save to API
      console.log('💾 Saving to server...');
      await axios.post('/api/cart/items', item);
      const response = await axios.get('/api/cart');
      setCart({
        items: response.data.items || [],
        totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: response.data.totalAmount || 0
      });
      
      console.log('✅ Item added to cart successfully');
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add item to cart' };
    }
  };

  // Update item quantity - ONLY if logged in
  const updateQuantity = async (productId, quantity, attributes = {}) => {
    try {
      if (!user) {
        alert('Please log in to modify your cart');
        return;
      }

      await axios.put(`/api/cart/items/${productId}`, { quantity, attributes });
      const response = await axios.get('/api/cart');
      setCart({
        items: response.data.items || [],
        totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: response.data.totalAmount || 0
      });
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  // Remove item from cart - ONLY if logged in
  const removeFromCart = async (productId, attributes = {}) => {
    try {
      if (!user) {
        alert('Please log in to modify your cart');
        return;
      }

      await axios.delete(`/api/cart/items/${productId}`, { data: { attributes } });
      const response = await axios.get('/api/cart');
      setCart({
        items: response.data.items || [],
        totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: response.data.totalAmount || 0
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Clear cart - ONLY if logged in
  const clearCart = async () => {
    try {
      if (!user) {
        return;
      }

      await axios.delete('/api/cart');
      setCart({
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Apply discount code - ONLY if logged in
  const applyDiscount = async (code) => {
    try {
      if (!user) {
        return { success: false, message: 'Please login to apply discount codes' };
      }

      const response = await axios.post('/api/cart/discount', { code });
      setCart({
        items: response.data.items || [],
        totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: response.data.totalAmount || 0,
        discount: response.data.discount || 0
      });
      return { success: true, message: 'Discount applied successfully' };
    } catch (error) {
      console.error('Error applying discount:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply discount code'
      };
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    isLoggedIn: !!user // Helper to check if user is logged in
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};