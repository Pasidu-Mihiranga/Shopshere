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
  
  // Fetch cart from API if user is logged in, otherwise from localStorage
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (user) {
          // Fetch from API
          const response = await axios.get('/api/cart');
          setCart({
            items: response.data.items || [],
            totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
            totalAmount: response.data.totalAmount || 0
          });
        } else {
          // Fetch from localStorage
          const savedCart = JSON.parse(localStorage.getItem('cart')) || { items: [], totalAmount: 0 };
          setCart({
            items: savedCart.items || [],
            totalItems: savedCart.items.reduce((total, item) => total + item.quantity, 0),
            totalAmount: savedCart.totalAmount || 0
          });
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [user]);
  
  // Save cart to localStorage when it changes (for non-logged in users)
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem('cart', JSON.stringify({ 
        items: cart.items, 
        totalAmount: cart.totalAmount 
      }));
    }
  }, [cart, loading, user]);
  
  // Add item to cart
  const addToCart = async (product, quantity, attributes = {}) => {
    try {
      const item = {
        productId: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images[0],
        attributes,
        quantity
      };
      
      if (user) {
        // Save to API
        await axios.post('/api/cart/items', item);
        const response = await axios.get('/api/cart');
        
        setCart({
          items: response.data.items || [],
          totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
          totalAmount: response.data.totalAmount || 0
        });
      } else {
        // Save to local state
        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(cartItem => 
          cartItem.productId === product._id && 
          JSON.stringify(cartItem.attributes) === JSON.stringify(attributes)
        );
        
        let newItems;
        
        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          newItems = [...cart.items];
          newItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          newItems = [...cart.items, item];
        }
        
        const newTotalAmount = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        setCart({
          items: newItems,
          totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
          totalAmount: newTotalAmount
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  
  // Update item quantity
  const updateQuantity = async (productId, quantity, attributes = {}) => {
    try {
      if (user) {
        // Update via API
        await axios.put(`/api/cart/items/${productId}`, { quantity, attributes });
        const response = await axios.get('/api/cart');
        
        setCart({
          items: response.data.items || [],
          totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
          totalAmount: response.data.totalAmount || 0
        });
      } else {
        // Update local state
        const itemIndex = cart.items.findIndex(item => 
          item.productId === productId && 
          JSON.stringify(item.attributes) === JSON.stringify(attributes)
        );
        
        if (itemIndex >= 0) {
          const newItems = [...cart.items];
          newItems[itemIndex].quantity = quantity;
          
          const newTotalAmount = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
          
          setCart({
            items: newItems,
            totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
            totalAmount: newTotalAmount
          });
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (productId, attributes = {}) => {
    try {
      if (user) {
        // Remove via API
        await axios.delete(`/api/cart/items/${productId}`, { data: { attributes } });
        const response = await axios.get('/api/cart');
        
        setCart({
          items: response.data.items || [],
          totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
          totalAmount: response.data.totalAmount || 0
        });
      } else {
        // Remove from local state
        const newItems = cart.items.filter(item => 
          !(item.productId === productId && 
            JSON.stringify(item.attributes) === JSON.stringify(attributes))
        );
        
        const newTotalAmount = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        setCart({
          items: newItems,
          totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
          totalAmount: newTotalAmount
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      if (user) {
        // Clear via API
        await axios.delete('/api/cart');
      }
      
      // Reset local state
      setCart({
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
      
      // Clear localStorage if user not logged in
      if (!user) {
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };
  
  // Apply discount code
  const applyDiscount = async (code) => {
    try {
      if (user) {
        // Apply via API
        const response = await axios.post('/api/cart/discount', { code });
        
        setCart({
          items: response.data.items || [],
          totalItems: response.data.items.reduce((total, item) => total + item.quantity, 0),
          totalAmount: response.data.totalAmount || 0,
          discount: response.data.discount || 0
        });
        
        return { success: true, message: 'Discount applied successfully' };
      } else {
        // TODO: Implement local discount logic
        return { success: false, message: 'Please login to apply discount codes' };
      }
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
    applyDiscount
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};