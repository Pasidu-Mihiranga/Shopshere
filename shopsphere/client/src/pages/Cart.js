import React, { useState } from 'react';
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
  
  // Handle quantity change
  const handleQuantityChange = (productId, quantity, attributes) => {
    if (quantity > 0) {
      updateQuantity(productId, quantity, attributes);
    }
  };
  
  // Handle remove item
  const handleRemoveItem = (productId, attributes) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      removeFromCart(productId, attributes);
    }
  };
  
  // Apply promo code
  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      setPromoError(true);
      setPromoMessage('Please enter a promo code');
      return;
    }
    
    // Placeholder for promo code logic
    setTimeout(() => {
      if (promoCode.toUpperCase() === 'DISCOUNT10') {
        setPromoError(false);
        setPromoMessage('Promo code applied! 10% discount');
        // In a real app, this would call an API endpoint
      } else {
        setPromoError(true);
        setPromoMessage('Invalid promo code');
      }
    }, 500);
  };
  
  // Calculate cart summary
  const calculateSummary = () => {
    const subtotal = cart.totalAmount;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const discount = 0; // Placeholder for discount logic
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
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }
  
  const cartSummary = calculateSummary();
  
  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>Your Shopping Cart</h1>
      </div>
      
      {cart.items.length === 0 ? (
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
              <div className="cart-col product-col">Product</div>
              <div className="cart-col price-col">Price</div>
              <div className="cart-col quantity-col">Quantity</div>
              <div className="cart-col total-col">Total</div>
              <div className="cart-col action-col"></div>
            </div>
            
            {cart.items.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-col product-col">
                  <div className="product-info">
                    <Link to={`/products/${item.productId}`} className="product-image">
                      <img 
                        src={item.image || '/images/placeholder-product.png'} 
                        alt={item.name} 
                      />
                    </Link>
                    <div className="product-details">
                      <Link to={`/products/${item.productId}`} className="product-name">
                        {item.name}
                      </Link>
                      {Object.keys(item.attributes || {}).length > 0 && (
                        <div className="product-attributes">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key}>
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="cart-col price-col">
                  ${item.price.toFixed(2)}
                </div>
                
                <div className="cart-col quantity-col">
                  <div className="quantity-selector">
                    <button 
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.attributes)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) {
                          handleQuantityChange(item.productId, value, item.attributes);
                        }
                      }}
                      min="1"
                    />
                    <button 
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.attributes)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="cart-col total-col">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <div className="cart-col action-col">
                  <button 
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item.productId, item.attributes)}
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="none" d="M0 0h24v24H0z"/>
                      <path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            <div className="cart-actions">
              <button 
                className="clear-cart-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
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
            
            <div className="summary-row">
              <span>Subtotal</span>
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
            
            {cartSummary.discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-${cartSummary.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row total">
              <span>Total</span>
              <span>${cartSummary.total.toFixed(2)}</span>
            </div>
            
            <div className="promo-code-container">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button 
                className="apply-promo-btn"
                onClick={handleApplyPromoCode}
              >
                Apply
              </button>
            </div>
            
            {promoMessage && (
              <div className={`promo-message ${promoError ? 'error' : 'success'}`}>
                {promoMessage}
              </div>
            )}
            
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
            
            <div className="secure-checkout">
              <div className="secure-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 1 1 14 0v1zm-2 0V9A5 5 0 0 0 7 9v1h10zm-6 4v4h2v-4h-2z" fill="currentColor"/>
                </svg>
              </div>
              <span>Secure Checkout</span>
            </div>
            
            <div className="payment-methods">
              <span className="payment-method">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                  <rect width="40" height="24" rx="4" fill="#fff"/>
                  <path d="M13 10h3v7h-3z" fill="#213f99"/>
                  <path d="M13 7h3v2h-3z" fill="#213f99"/>
                  <path d="M24 10h3v7h-3z" fill="#213f99"/>
                  <path d="M16 14c0-2 2-2 2-2h2v-2h-2s-4 0-4 4 4 4 4 4h2v-2h-2s-2 0-2-2z" fill="#213f99"/>
                </svg>
              </span>
              <span className="payment-method">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                  <rect width="40" height="24" rx="4" fill="#fff"/>
                  <path d="M10 8h5v8h-5z" fill="#ff5f00"/>
                  <path d="M11 12a5 5 0 0 1 1.9-4H10v8h2.9a5 5 0 0 1-1.9-4z" fill="#eb001b"/>
                  <path d="M30 12a5 5 0 0 1-8 4h2.9v-8H22a5 5 0 0 1 8 4z" fill="#f79e1b"/>
                </svg>
              </span>
              <span className="payment-method">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                  <rect width="40" height="24" rx="4" fill="#fff"/>
                  <path d="M29 8H11c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h18c.6 0 1-.4 1-1V9c0-.6-.4-1-1-1z" fill="#FCB941"/>
                  <path d="M12 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="#FFF"/>
                  <path d="M24 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="#FFF"/>
                </svg>
              </span>
              <span className="payment-method">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                  <rect width="40" height="24" rx="4" fill="#fff"/>
                  <path d="M24 7H14v10h10V7z" fill="#006FCF"/>
                  <path d="M18 10l-1 2-1-2h-1l1.5 3L15 16h1l1-2 1 2h1l-1.5-3L19 10h-1z" fill="#FFF"/>
                  <path d="M24 10h-1l-1 3-1-3h-1l1.5 4h1l1.5-4z" fill="#FFF"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;