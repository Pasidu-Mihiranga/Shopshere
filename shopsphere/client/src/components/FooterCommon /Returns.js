// src/pages/help/Returns.jsx
import React, { useState } from 'react';
import './CommonPages.css';

const Returns = () => {
  const [selectedCategory, setSelectedCategory] = useState('electronics');

  const returnPolicies = {
    electronics: {
      name: 'Electronics',
      icon: '📱',
      period: '10 Days',
      conditions: 'Original packaging, unused, with accessories',
      refundTime: '5-7 business days'
    },
    fashion: {
      name: 'Fashion & Apparel',
      icon: '👕',
      period: '30 Days',
      conditions: 'Unworn, tags attached, original packaging',
      refundTime: '3-5 business days'
    },
    books: {
      name: 'Books & Media',
      icon: '📚',
      period: '15 Days',
      conditions: 'Undamaged, no markings or highlighting',
      refundTime: '3-5 business days'
    },
    home: {
      name: 'Home & Kitchen',
      icon: '🏠',
      period: '7 Days',
      conditions: 'Unused, original packaging with all parts',
      refundTime: '5-7 business days'
    }
  };

  const returnSteps = [
    { step: 1, title: 'Initiate Return', desc: 'Go to My Orders and select return', icon: '📋' },
    { step: 2, title: 'Schedule Pickup', desc: 'Choose convenient pickup date & time', icon: '📅' },
    { step: 3, title: 'Pack Securely', desc: 'Pack item in original packaging', icon: '📦' },
    { step: 4, title: 'Pickup & Inspect', desc: 'Our team picks up and inspects', icon: '🔍' },
    { step: 5, title: 'Get Refund', desc: 'Refund processed to original payment method', icon: '💰' }
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a> / 
          <a href="/help" className="breadcrumb-link">Help</a> / Returns
        </div>

        <div className="page-header">
          <h1 className="page-title">🔄 Returns & Refunds</h1>
          <p className="page-subtitle">
            Easy returns with free pickup and quick refunds for your peace of mind
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📦</span>
            Return Policy by Category
          </h2>
          <div className="info-grid">
            {Object.entries(returnPolicies).map(([key, policy]) => (
              <div 
                key={key}
                className={`info-card ${selectedCategory === key ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(key)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{policy.icon}</div>
                <h3>{policy.name}</h3>
                <p><strong>Return Period:</strong> {policy.period}</p>
                <p><strong>Refund Time:</strong> {policy.refundTime}</p>
                <small>{policy.conditions}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🚀</span>
            How to Return
          </h2>
          <div className="section-content">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {returnSteps.map((item) => (
                <div key={item.step} style={{ 
                  flex: '1 1 200px',
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '15px',
                  margin: '0.5rem'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                  <h4>Step {item.step}</h4>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">✅</span>
            What Can Be Returned
          </h2>
          <div className="section-content">
            <div className="info-grid">
              <div style={{ 
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: 'white',
                padding: '2rem',
                borderRadius: '15px'
              }}>
                <h3>✅ Returnable Items</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>✓ Defective or damaged products</li>
                  <li>✓ Wrong item received</li>
                  <li>✓ Size/color mismatch</li>
                  <li>✓ Items not as described</li>
                  <li>✓ Quality issues</li>
                  <li>✓ Missing parts/accessories</li>
                </ul>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                color: 'white',
                padding: '2rem',
                borderRadius: '15px'
              }}>
                <h3>❌ Non-Returnable Items</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>✗ Perishable goods</li>
                  <li>✗ Personalized items</li>
                  <li>✗ Digital downloads</li>
                  <li>✗ Hygiene products (opened)</li>
                  <li>✗ Gift cards & vouchers</li>
                  <li>✗ Items damaged by misuse</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="interactive-element">
          <h3>🚚 Free Return Pickup</h3>
          <p>We'll pick up your return items for free from your doorstep</p>
          <button className="cta-button">Schedule Pickup</button>
          <button className="cta-button">Check Return Status</button>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">💳</span>
            Refund Options
          </h2>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>🏦 Original Payment Method</h3>
                <p>Refund to the card/account used for purchase</p>
                <p><strong>Processing:</strong> 5-7 business days</p>
                <span className="status-indicator status-success"></span>
                Most Popular
              </div>
              <div className="info-card">
                <h3>💰 ShopSphere Wallet</h3>
                <p>Instant credit to your wallet</p>
                <p><strong>Processing:</strong> Immediate</p>
                <span className="status-indicator status-success"></span>
                Instant Refund
              </div>
              <div className="info-card">
                <h3>🎁 Store Credit</h3>
                <p>Get 110% value as store credit</p>
                <p><strong>Processing:</strong> Immediate</p>
                <span className="status-indicator status-info"></span>
                Bonus Value
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">❓</span>
            Return FAQs
          </h2>
          <div className="faq-item">
            <div className="faq-question">
              Can I return items without original packaging?
            </div>
            <div className="faq-answer">
              Items should be returned in original packaging when possible. However, if packaging is damaged during delivery, contact customer support with photos for assistance.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              What if I lose the return pickup?
            </div>
            <div className="faq-answer">
              No worries! You can reschedule pickup up to 3 times. Alternatively, drop off at any of our 500+ partner locations across India.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              How can I track my return status?
            </div>
            <div className="faq-answer">
              Track your return in "My Orders" section or via SMS/email updates. You'll receive notifications at each step from pickup to refund processing.
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🛡️</span>
            Return Protection
          </h2>
          <div className="highlight-box">
            <h3>🔒 Your Returns Are Protected</h3>
            <div className="info-grid" style={{ marginTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <h4>📷 Photo Verification</h4>
                <p>We photograph items during pickup for transparency</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4>📋 Quality Check</h4>
                <p>Professional inspection at our facilities</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4>💯 Fair Resolution</h4>
                <p>Quick resolution for any return disputes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;