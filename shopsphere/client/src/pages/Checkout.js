import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Checkout.css';
import OrderSuccessAnimation from '../components/OrderSuccessAnimation';

const Checkout = () => {
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  
  // Shipping information state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  // Payment information state
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Initialize shipping info with user data when user loads
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      navigate('/cart');
      return;
    }
  }, [user, cart, cartLoading, navigate]);
  
  // Calculate order summary
  const calculateSummary = () => {
    const subtotal = cart?.totalAmount || 0;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const discount = 0;
    const tax = (subtotal * 0.07).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(shipping) - parseFloat(discount) + parseFloat(tax)).toFixed(2);
    
    return {
      subtotal,
      shipping,
      discount,
      tax,
      total
    };
  };
  
  // Handle shipping info input change
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle card info input change
  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setCardInfo(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setCardInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Validate form inputs
  const validateForm = () => {
    // Validate shipping information
    if (!shippingInfo.fullName || !shippingInfo.phoneNumber || !shippingInfo.email ||
        !shippingInfo.street || !shippingInfo.city || !shippingInfo.state || 
        !shippingInfo.zipCode || !shippingInfo.country) {
      setError('Please fill in all shipping information fields');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate payment information
    if (!cardInfo.cardNumber || !cardInfo.cardName || 
        !cardInfo.expiryMonth || !cardInfo.expiryYear || !cardInfo.cvv) {
      setError('Please fill in all payment details');
      return false;
    }
    
    // Basic card validation
    if (cardInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (cardInfo.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }
    
    // Validate expiry date
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(cardInfo.expiryYear);
    const expMonth = parseInt(cardInfo.expiryMonth);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setError('Card has expired');
      return false;
    }
    
    return true;
  };
  
  // Place order
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setProcessingOrder(true);
      setError('');
      
      // Prepare order data
      // Prepare order data
// Prepare order data
// Prepare order data
const orderData = {
  items: (cart?.items || []).map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
    attributes: item.attributes || {}
  })),
  shipping: {
    address: {
      addressType: "shipping",
      street: shippingInfo.street,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode,
      country: shippingInfo.country,
      isDefault: false
    },
    method: "Standard Shipping"
  },
  billing: {
    address: {
      addressType: "billing", 
      street: shippingInfo.street,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode,
      country: shippingInfo.country,
      isDefault: false
    },
    subtotal: calculateSummary().subtotal,
    shipping: calculateSummary().shipping,
    discount: calculateSummary().discount,
    total: parseFloat(calculateSummary().total)
  },
  payment: {
    method: 'card',
    transactionId: 'temp_' + Date.now(), // temporary transaction ID
    status: 'pending'
  }
};
      // Add this RIGHT BEFORE: const response = await axios.post('http://localhost:5000/api/orders', orderData);

console.log('=== ORDER DATA BEING SENT ===');
console.log(JSON.stringify(orderData, null, 2));
console.log('==============================');
      // Create order
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      // Process payment (simulate payment processing)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart after successful order
      // if (clearCart) {
      //   await clearCart();
      // }
      
      // Navigate to order confirmation page
      // Show success animation instead of navigating immediately
      setOrderResponse(response.data);
      setShowSuccessAnimation(true);
      setProcessingOrder(false);
    } catch (err) {
  console.error('Error placing order:', err);
  console.error('Full error response:', JSON.stringify(err.response, null, 2)); // CHANGED THIS
  console.error('Error response data:', JSON.stringify(err.response?.data, null, 2)); // CHANGED THIS
  console.error('Error status:', err.response?.status);
  setError(err.response?.data?.message || 'Failed to place your order. Please try again.');
  setProcessingOrder(false);
}
  };
  
  if (loading || cartLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Preparing checkout...</p>
      </div>
    );
  }

  // Handle missing cart gracefully
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="page-header">
          <h1>Checkout</h1>
        </div>
        <div className="error-message">
          Your cart is empty. <a href="/products">Continue Shopping</a>
        </div>
      </div>
    );
  }
  
  const handleGoHome = () => {
  navigate('/');
};

const handleViewOrders = () => {
  navigate('/dashboard/orders');
};

const handleAnimationComplete = () => {
  if (clearCart) {
    clearCart();
  }
  // Animation finished, you can add any additional logic here
  console.log('Order success animation completed');
};
  const summary = calculateSummary();
  
  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="checkout-container">
        <div className="checkout-main">
          {/* Shipping Information Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Shipping Information</h2>
            </div>
            
            <div className="shipping-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleShippingChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={shippingInfo.street}
                  onChange={handleShippingChange}
                  placeholder="Enter your street address"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    placeholder="Enter your city"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State/Province *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    placeholder="Enter your state"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">Postal Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    placeholder="Enter postal code"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    placeholder="Enter your country"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Information Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Payment Information</h2>
            </div>
            
            <div className="payment-info">
              <div className="payment-method-header">
                <div className="payment-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M22 10v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V10h20zm0-2H2V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4zm-7 8v2h4v-2h-4z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="payment-label">
                  <span>Credit / Debit Card</span>
                  <div className="payment-cards">
                    <span className="payment-card-icon">Visa</span>
                    <span className="payment-card-icon">Mastercard</span>
                    <span className="payment-card-icon">Amex</span>
                  </div>
                </div>
              </div>
              
              <div className="card-payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number *</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardInfo.cardNumber}
                    onChange={handleCardInfoChange}
                    maxLength="19"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardName">Name on Card *</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={cardInfo.cardName}
                    onChange={handleCardInfoChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <div className="expiry-inputs">
                      <select
                        name="expiryMonth"
                        value={cardInfo.expiryMonth}
                        onChange={handleCardInfoChange}
                        required
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          return (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          );
                        })}
                      </select>
                      <select
                        name="expiryYear"
                        value={cardInfo.expiryYear}
                        onChange={handleCardInfoChange}
                        required
                      >
                        <option value="">YY</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year.toString().slice(-2)}>
                              {year.toString().slice(-2)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV *</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={cardInfo.cvv}
                      onChange={handleCardInfoChange}
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="order-summary">
            <div className="summary-header">
              <h2>Order Summary</h2>
              <span className="item-count">{cart?.items?.length || 0} items</span>
            </div>
            
            <div className="order-items">
              {(cart?.items || []).map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.image || '/images/placeholder-product.png'} 
                      alt={item.name || 'Product'} 
                    />
                    <span className="item-quantity">{item.quantity || 0}</span>
                  </div>
                  <div className="item-details">
                    <p className="item-name">{item.name || 'Unknown Product'}</p>
                    {Object.keys(item.attributes || {}).length > 0 && (
                      <div className="item-attributes">
                        {Object.entries(item.attributes || {}).map(([key, value]) => (
                          <span key={key}>{key}: {value}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="item-price">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${summary.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                {summary.shipping === 0 ? (
                  <span className="free-shipping">Free</span>
                ) : (
                  <span>${summary.shipping.toFixed(2)}</span>
                )}
              </div>
              
              {summary.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-${summary.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="summary-row">
                <span>Tax</span>
                <span>${summary.tax}</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>${summary.total}</span>
              </div>
            </div>
            
            <button 
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={processingOrder}
            >
              {processingOrder ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Place Order - $${summary.total}`
              )}
            </button>
            
            <div className="secure-checkout">
              <div className="secure-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 1 1 14 0v1zm-2 0V9A5 5 0 0 0 7 9v1h10zm-6 4v4h2v-4h-2z" fill="currentColor"/>
                </svg>
              </div>
              <span>Secure 256-bit SSL Encryption</span>
            </div>
            
            <div className="checkout-policy">
              By placing your order, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
      {showSuccessAnimation && (
  <OrderSuccessAnimation
    orderNumber={orderResponse?.orderNumber || 'N/A'}
    onGoHome={handleGoHome}
    onViewOrders={handleViewOrders}
    onComplete={handleAnimationComplete}
  />
)}
    </div>
  );
};

export default Checkout;