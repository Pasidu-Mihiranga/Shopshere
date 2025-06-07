// src/pages/help/Shipping.js
import React, { useState } from 'react';
import './CommonPages.css';

const Shipping = () => {
  const [selectedZone, setSelectedZone] = useState('metro');

  const shippingZones = {
    metro: {
      name: 'Metro Cities',
      icon: '🏙️',
      delivery: '1-2 Days',
      charge: 'FREE above ₹500',
      cities: 'Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune'
    },
    tier1: {
      name: 'Tier 1 Cities',
      icon: '🌆',
      delivery: '2-3 Days',
      charge: 'FREE above ₹750',
      cities: 'Ahmedabad, Kolkata, Surat, Jaipur, Lucknow'
    },
    tier2: {
      name: 'Tier 2 Cities',
      icon: '🏘️',
      delivery: '3-5 Days',
      charge: 'FREE above ₹999',
      cities: 'Indore, Bhopal, Coimbatore, Kochi, Chandigarh'
    },
    rural: {
      name: 'Rural Areas',
      icon: '🌾',
      delivery: '5-7 Days',
      charge: '₹99 shipping',
      cities: 'Remote areas and villages'
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a> / 
          <a href="/help" className="breadcrumb-link">Help</a> / Shipping
        </div>

        <div className="page-header">
          <h1 className="page-title">🚚 Shipping & Delivery</h1>
          <p className="page-subtitle">
            Fast, reliable delivery across India with real-time tracking
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📍</span>
            Delivery Zones & Timeline
          </h2>
          <div className="info-grid">
            {Object.entries(shippingZones).map(([key, zone]) => (
              <div 
                key={key}
                className={`info-card ${selectedZone === key ? 'selected' : ''}`}
                onClick={() => setSelectedZone(key)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{zone.icon}</div>
                <h3>{zone.name}</h3>
                <p><strong>Delivery:</strong> {zone.delivery}</p>
                <p><strong>Shipping:</strong> {zone.charge}</p>
                <small>{zone.cities}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📦</span>
            Shipping Options
          </h2>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>🚀 Express Delivery</h3>
                <p>Same day delivery in select metros</p>
                <p><strong>₹149</strong> additional charge</p>
                <span className="status-indicator status-success"></span>
                Available in 12 cities
              </div>
              <div className="info-card">
                <h3>📅 Scheduled Delivery</h3>
                <p>Choose your preferred date & time</p>
                <p><strong>FREE</strong> with any order</p>
                <span className="status-indicator status-info"></span>
                Available nationwide
              </div>
              <div className="info-card">
                <h3>🏪 Store Pickup</h3>
                <p>Collect from nearest store</p>
                <p><strong>FREE</strong> always</p>
                <span className="status-indicator status-success"></span>
                200+ pickup points
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            Shipping Policies
          </h2>
          <div className="section-content">
            <h3>📦 Order Processing</h3>
            <ul>
              <li>Orders are processed within 24 hours on business days</li>
              <li>Orders placed after 6 PM are processed the next business day</li>
              <li>Weekend orders are processed on Monday</li>
              <li>Festival/holiday processing may take additional time</li>
            </ul>

            <h3>📍 Delivery Address</h3>
            <ul>
              <li>Ensure complete and accurate delivery address</li>
              <li>Include landmark and contact number</li>
              <li>Address changes possible only before dispatch</li>
              <li>PO Box deliveries not available for all products</li>
            </ul>

            <div className="highlight-box">
              <h3>🎯 Free Shipping Conditions</h3>
              <p>Free shipping is automatically applied when your order value exceeds the minimum threshold for your delivery location. No coupon codes needed!</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🔍</span>
            Track Your Order
          </h2>
          <div className="interactive-element">
            <h3>📱 Real-time Order Tracking</h3>
            <p>Track your order status in real-time with our advanced tracking system</p>
            <div style={{ margin: '2rem 0' }}>
              <input 
                type="text" 
                placeholder="Enter your order ID (e.g., SP123456789)"
                style={{
                  padding: '1rem',
                  fontSize: '1.1rem',
                  border: '2px solid #ddd',
                  borderRadius: '50px',
                  width: '300px',
                  marginRight: '1rem'
                }}
              />
              <button className="cta-button">Track Order</button>
            </div>
            <p>You can also track via SMS, WhatsApp, or mobile app</p>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">❓</span>
            Shipping FAQs
          </h2>
          <div className="faq-item">
            <div className="faq-question">
              What if I'm not available during delivery?
            </div>
            <div className="faq-answer">
              Our delivery partner will attempt delivery 3 times. You can also reschedule delivery or choose a pickup point. We'll notify you via SMS/email before each attempt.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              Can I change my delivery address after placing order?
            </div>
            <div className="faq-answer">
              Address changes are possible only before the order is dispatched. Contact customer support immediately with your order ID for address modifications.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              Do you deliver to remote areas?
            </div>
            <div className="faq-answer">
              Yes! We deliver to 25,000+ pin codes across India, including remote areas. Delivery time may be 5-7 days for remote locations with additional shipping charges.
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🌱</span>
            Eco-Friendly Shipping
          </h2>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>♻️ Sustainable Packaging</h3>
                <p>100% recyclable materials</p>
              </div>
              <div className="info-card">
                <h3>🚛 Carbon Neutral Delivery</h3>
                <p>Offset delivery emissions</p>
              </div>
              <div className="info-card">
                <h3>📦 Minimal Packaging</h3>
                <p>Right-sized boxes to reduce waste</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
