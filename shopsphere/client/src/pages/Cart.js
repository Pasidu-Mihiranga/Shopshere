import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState(false);
  
  // Debug cart state
  useEffect(() => {
    console.log('=== CART DEBUG INFO ===');
    console.log('Cart object:', cart);
    console.log('Cart items:', cart?.items);
    console.log('Cart items length:', cart?.items?.length);
    console.log('Cart loading:', loading);
    console.log('User:', user);
    console.log('========================');
  }, [cart, loading, user]);
  
  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-product.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  // Generate unique key for cart item
  const getItemKey = (item) => {
    const attributesKey = Object.keys(item.attributes || {}).length > 0 
      ? JSON.stringify(item.attributes) 
      : '';
    return `${item.productId || item._id}-${attributesKey}`;
  };
  
  // Handle quantity change
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      console.log('Updating quantity:', {
        productId: item.productId || item._id,
        quantity: newQuantity,
        attributes: item.attributes
      });
      
      await updateQuantity(item.productId || item._id, newQuantity, item.attributes || {});
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };
  
  // Handle remove item
  const handleRemoveItem = async (item) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        console.log('Removing item:', {
          productId: item.productId || item._id,
          attributes: item.attributes
        });
        
        await removeFromCart(item.productId || item._id, item.attributes || {});
      } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item. Please try again.');
      }
    }
  };
  
  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      }
    }
  };
  
  // Calculate cart summary
  const calculateSummary = () => {
    const cartItems = cart?.items || [];
    
    // Calculate subtotal from items if totalAmount is not available
    const subtotal = cart?.totalAmount || cartItems.reduce((total, item) => {
      return total + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    const shipping = subtotal > 50 ? 0 : 5.99;
    const discount = cart?.discount || 0;
    const total = subtotal + shipping - discount;
    
    return {
      subtotal,
      shipping,
      discount,
      total
    };
  };
  
  // Handle checkout
  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }
  
  // Get cart items - handle different possible structures
  const cartItems = cart?.items || [];
  const cartSummary = calculateSummary();
  
  console.log('Rendering cart with items:', cartItems);
  
  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>Your Shopping Cart ({cartItems.length} items)</h1>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items-container">
            <div className="cart-header">
              <div className="cart-col product-col pc">Product</div>
              <div className="cart-col price-col">Price</div>
              <div className="cart-col quantity-col">QTY</div>
              <div className="cart-col total-col">Total</div>
              <div className="cart-col action-col"></div>
            </div>
            
            {cartItems.map((item, index) => {
              console.log(`Rendering cart item ${index}:`, item);
              
              return (
                <div key={getItemKey(item)} className="cart-item">
                  <div className="cart-col product-col ">
                    <div className="product-info ">
                      <Link to={`/products/${item.productId || item._id}`} className="product-image">
                        <img 
                          src={getImageUrl(item.image)}
                          alt={item.name || 'Product'}
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            e.target.src = '/images/placeholder-product.png';
                          }}
                        />
                      </Link>
                      <div className="product-details">
                        <Link to={`/products/${item.productId || item._id}`} className="product-name">
                          {item.name || 'Unknown Product'}
                        </Link>
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="product-attributes">
                            {Object.entries(item.attributes).map(([key, value]) => (
                              <span key={key} className="attribute-item">
                                <strong>{key}:</strong> {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="product-sku">
                          ID: {item.productId || item._id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="cart-col price-col">
                    <span className="price-label">Price:</span>
                    <span className="price-value">${(item.price || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="cart-col quantity-col">
                    <span className="quantity-label">Qty:</span>
                    <div className="quantity-selector">
                      <button 
                        className="quantity-btn decrease"
                        onClick={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value && value > 0) {
                            handleQuantityChange(item, value);
                          }
                        }}
                        min="1"
                        max="99"
                        className="quantity-input"
                      />
                      <button 
                        className="quantity-btn increase"
                        onClick={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-col total-col">
                    <span className="total-label">Total:</span>
                    <span className="total-value">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="cart-col action-col">
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item)}
                      aria-label={`Remove ${item.name || 'item'} from cart`}
                      title={`Remove ${item.name || 'item'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
            
            <div className="cart-actions">
              <button 
                className="clear-cart-btn"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
              <Link to="/products" className="continue-shopping-link">
                Continue Shopping
              </Link>
            </div>
          </div>
          
          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${cartSummary.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                {cartSummary.shipping === 0 ? (
                  <span className="free-shipping">Free</span>
                ) : (
                  <span>${cartSummary.shipping.toFixed(2)}</span>
                )}
              </div>
              
              {cartSummary.shipping > 0 && cartSummary.subtotal < 50 && (
                <div className="shipping-note">
                  <small>Free shipping on orders over $50</small>
                </div>
              )}
              
              {cartSummary.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-${cartSummary.discount.toFixed(2)}</span>
                </div>
              )}
              
              <hr className="summary-divider" />
              
              <div className="summary-row total">
                <span>Total</span>
                <span>${cartSummary.total.toFixed(2)}</span>
              </div>
            </div>
            
            {promoMessage && (
              <div className={`promo-message ${promoError ? 'error' : 'success'}`}>
                {promoMessage}
              </div>
            )}
            
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              {!user ? 'Login to Checkout' : 'Proceed to Checkout'}
            </button>
            
          </div>
        </div>
      )}
      
      
    </div>
  );
};

export default Cart;