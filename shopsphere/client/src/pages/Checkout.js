import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Safe initialization with fallbacks
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // ✅ Initialize with empty object and safe user access
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  
  // ✅ Initialize with empty object
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // ✅ Update newAddress when user loads
  useEffect(() => {
    if (user && user.firstName && user.lastName) {
      setNewAddress(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`,
        phoneNumber: user.phoneNumber || ''
      }));
    }
  }, [user]);
  
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
  
  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        navigate('/login?redirect=checkout');
        return;
      }
      
      if (cartLoading) return;
      
      if (!cart || !cart.items || cart.items.length === 0) {
        navigate('/cart');
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/users/addresses');
        setAddresses(response.data || []);
        
        // Select default address if available
        const defaultAddress = (response.data || []).find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (response.data && response.data.length > 0) {
          setSelectedAddress(response.data[0]._id);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load your saved addresses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, [user, navigate, cart, cartLoading]);
  
  // ✅ Handle new address input change with complete safety
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => {
      // Ensure prev is always an object
      const safePrev = prev || {};
      return {
        ...safePrev,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };
  
  // ✅ Handle card info input change with complete safety
  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setCardInfo(prev => {
        const safePrev = prev || {};
        return { 
          ...safePrev,
          [name]: formattedValue 
        };
      });
    } else {
      setCardInfo(prev => {
        const safePrev = prev || {};
        return { 
          ...safePrev,
          [name]: value 
        };
      });
    }
  };
  
  // Save new address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/users/addresses', newAddress);
      
      setAddresses(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, response.data];
      });
      setSelectedAddress(response.data._id);
      setShowNewAddressForm(false);
      setNewAddress({
        fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        phoneNumber: user?.phoneNumber || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      });
      
      setError('');
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Place order
  const handlePlaceOrder = async () => {
    // Validate inputs
    // if (!selectedAddress && !showNewAddressForm) {
    //   setError('Please select a shipping address');
    //   return;
    // }
    
    if (showNewAddressForm) {
      if (!newAddress.fullName || !newAddress.street || !newAddress.city || 
          !newAddress.state || !newAddress.zipCode || !newAddress.country) {
        setError('Please fill in all address fields');
        return;
      }
    }
    
    if (paymentMethod === 'card') {
      if (!cardInfo.cardNumber || !cardInfo.cardName || 
          !cardInfo.expiryMonth || !cardInfo.expiryYear || !cardInfo.cvv) {
        setError('Please fill in all payment details');
        return;
      }
      
      // Basic validation
      if (cardInfo.cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number');
        return;
      }
      
      if (cardInfo.cvv.length < 3) {
        setError('Please enter a valid CVV');
        return;
      }
    }
    
    try {
      setProcessingOrder(true);
      setError('');
      
      // Prepare order data
      const orderData = {
        // addressId: selectedAddress,
        // newAddress: showNewAddressForm ? newAddress : null,
        items: (cart?.items || []).map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          attributes: item.attributes || {}
        })),
        payment: {
          method: paymentMethod,
          details: paymentMethod === 'card' ? {
            last4: cardInfo.cardNumber.slice(-4)
          } : {}
        }
      };
      
      // Create order
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      // Process payment (in a real app, this would typically involve a payment gateway)
      // Here we're just simulating a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart after successful order
      if (clearCart) {
        await clearCart();
      }
      

      //----------------------------------
      //routing hadala na
      //---------------------------------
      // Navigate to order confirmation page
      navigate(`/order-confirmation/${response.data._id}`);
    } catch (err) {
      console.error('Error placing order:', err);
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

  // ✅ Handle missing cart gracefully
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
  
  const summary = calculateSummary();
  
  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="checkout-container">
        <div className="checkout-main">
          {/* Shipping Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Shipping Information</h2>
            </div>
            
            {addresses.length > 0 && !showNewAddressForm ? (
              <div className="addresses-list">
                {addresses.map(address => (
                  <div key={address._id} className="address-option">
                    <input
                      type="radio"
                      id={`address-${address._id}`}
                      name="shipping-address"
                      checked={selectedAddress === address._id}
                      onChange={() => setSelectedAddress(address._id)}
                    />
                    <label htmlFor={`address-${address._id}`}>
                      <div className="address-details">
                        <p className="address-name">{address.fullName}</p>
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                        <p>{address.phoneNumber}</p>
                        {address.isDefault && <span className="default-badge">Default</span>}
                      </div>
                    </label>
                  </div>
                ))}
                
                <button 
                  className="add-address-btn"
                  onClick={() => setShowNewAddressForm(true)}
                >
                  + Add New Address
                </button>
              </div>
            ) : (
              <div className="new-address-form">
                <form onSubmit={handleSaveAddress}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={newAddress.fullName || ''}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={newAddress.phoneNumber || ''}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="street">Street Address</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={newAddress.street || ''}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={newAddress.city || ''}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State/Province</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={newAddress.state || ''}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="zipCode">Postal Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={newAddress.zipCode || ''}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={newAddress.country || ''}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={newAddress.isDefault || false}
                      onChange={handleAddressChange}
                    />
                    <label htmlFor="isDefault">Set as default shipping address</label>
                  </div>
                  
                  <div className="address-form-actions">
                    {addresses.length > 0 && (
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn-primary">Save Address</button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Payment Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Payment Method</h2>
            </div>
            
            <div className="payment-options">
              <div className="payment-option">
                <input
                  type="radio"
                  id="payment-card"
                  name="payment-method"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <label htmlFor="payment-card">
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
                </label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="payment-paypal"
                  name="payment-method"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                />
                <label htmlFor="payment-paypal">
                  <div className="payment-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="none" d="M0 0h24v24H0z"/>
                      <path d="M8.495 20.667h1.551l.538-3.376h2.12c2.905 0 5.429-1.18 5.824-4.785.213-1.936-.51-3.055-1.48-3.689-.97-.635-2.192-.919-3.768-.919h-4.47L6 20.667h2.495zm2.092-7.027l.449-2.845h1.898c.31 0 .961.061 1.473.308.379.186.672.51.661 1.1-.044 1.29-1.1 1.437-2.204 1.437H10.587zm9.013-3.753c-.532-2.924-3.323-4.085-6.477-4.085H8.148L5 20.667h3.287l.746-4.7-.402 4.7h3.287l.746-4.7-.268 4.7h3.288l.606-3.805C16.323 14.586 14.593 12 14.878 6h3.218c.173 0 .11-.524.04-1.015-.134-.93-.12-.852-.542-1.736z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="payment-label">
                    <span>PayPal</span>
                    <small>You'll be redirected to PayPal to complete your purchase securely.</small>
                  </div>
                </label>
              </div>
            </div>
            
            {paymentMethod === 'card' && (
              <div className="card-payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardInfo.cardNumber || ''}
                    onChange={handleCardInfoChange}
                    maxLength="19"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardName">Name on Card</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={cardInfo.cardName || ''}
                    onChange={handleCardInfoChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <div className="expiry-inputs">
                      <select
                        name="expiryMonth"
                        value={cardInfo.expiryMonth || ''}
                        onChange={handleCardInfoChange}
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
                        value={cardInfo.expiryYear || ''}
                        onChange={handleCardInfoChange}
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
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={cardInfo.cvv || ''}
                      onChange={handleCardInfoChange}
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
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
                'Place Order'
              )}
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
            
            <div className="checkout-policy">
              By placing your order, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;