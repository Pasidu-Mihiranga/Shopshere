import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://Localhost:5000/api/orders/${orderId}`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="error-container">
        <h2>Order not found</h2>
        <p>We couldn't find the order you're looking for.</p>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate order summary
  const calculateSummary = () => {
  const subtotal = order.summary?.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = order.summary?.shipping || 0;
  const discount = order.summary?.discount || 0;
  const tax = order.summary?.tax || 0;
  const total = order.summary?.total || (subtotal + shipping + tax - discount);
  
  return {
    subtotal,
    shipping,
    discount,
    tax,
    total
  };
};
  
  const summary = calculateSummary();
  
  return (
    <div className="order-confirmation-page">
      <div className="confirmation-header">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z" fill="currentColor"/>
          </svg>
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been received and is being processed.</p>
      </div>
      
      <div className="confirmation-container">
        <div className="order-details">
          <div className="section-header">
            <h2>Order Details</h2>
          </div>
          
          <div className="order-info">
            <div className="info-group">
              <div className="info-label">Order Number:</div>
              <div className="info-value">{order.orderNumber}</div>
            </div>
            <div className="info-group">
              <div className="info-label">Order Date:</div>
              <div className="info-value">{formatDate(order.createdAt)}</div>
            </div>
            <div className="info-group">
              <div className="info-label">Payment Method:</div>
              <div className="info-value">
                Credit/Debit Card
                {order.payment?.details?.last4 && ` (ending in ${order.payment.details.last4})`}
              </div>
            </div>
            <div className="info-group">
              <div className="info-label">Shipping Method:</div>
              <div className="info-value">{order.shipping?.method || 'Standard Shipping'}</div>
            </div>
          </div>
          
          <div className="order-address">
            
            <div className="address-section">
              <h3>Shipping Address</h3>
              <div className="address">
                <p>{order.shippingInfo?.fullName}</p>
                <p>{order.shippingInfo?.street}</p>
                <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}</p>
                <p>{order.shippingInfo?.country}</p>
                <p>{order.shippingInfo?.phoneNumber}</p>
                <p>{order.shippingInfo?.email}</p>
              </div>
            </div>
            <div className="address-section">
              <h3>Billing Address</h3>
              <div className="address">
                <p>{order.shippingInfo?.fullName}</p>
                <p>{order.shippingInfo?.street}</p>
                <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}</p>
                <p>{order.shippingInfo?.country}</p>
                <p>{order.shippingInfo?.phoneNumber}</p>
                <p>{order.shippingInfo?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="delivery-info">
            <h3>Estimated Delivery</h3>
            <div className="delivery-date">
              {order.shipping?.estimatedDelivery?.from && order.shipping?.estimatedDelivery?.to ? (
                <p>
                  {formatDate(order.shipping.estimatedDelivery.from)} - 
                  {formatDate(order.shipping.estimatedDelivery.to)}
                </p>
              ) : (
                <p>5-7 business days</p>
              )}
            </div>
            
            {order.shipping?.trackingNumber && (
              <div className="tracking-info">
                <p>Tracking Number: <strong>{order.shipping.trackingNumber}</strong></p>
                <a href={`/track/${order.shipping.trackingNumber}`} className="tracking-link">
                  Track Your Order
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="order-summary">
          <div className="section-header">
            <h2>Order Summary</h2>
          </div>
          
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img 
                    src={item.image || '/images/placeholder-product.png'} 
                    alt={item.name} 
                  />
                  <span className="item-quantity">{item.quantity}</span>
                </div>
                <div className="item-details">
                  <p className="item-name">{item.name}</p>
                  {Object.keys(item.attributes || {}).length > 0 && (
                    <div className="item-attributes">
                      {Object.entries(item.attributes).map(([key, value]) => (
                        <span key={key}>{key}: {value}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
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
              <span>${summary.tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>${summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="confirmation-actions">
        <Link to="/orders" className="btn-secondary">View My Orders</Link>
        <Link to="/" className="btn-primary">Continue Shopping</Link>
      </div>
      
      <div className="help-section">
        <h3>Need Help?</h3>
        <p>If you have any questions about your order, please visit our <a href="/help">Help Center</a> or <a href="/contact">Contact Us</a>.</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;