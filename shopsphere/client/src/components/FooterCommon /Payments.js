// src/pages/help/Payments.jsx
import React, { useState } from 'react';
import './CommonPages.css';

const Payments = () => {
  const [selectedPayment, setSelectedPayment] = useState('card');

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Cards', icon: '💳', status: 'Secure & Instant' },
    { id: 'upi', name: 'UPI Payment', icon: '📱', status: 'Quick & Easy' },
    { id: 'wallet', name: 'Digital Wallets', icon: '💰', status: 'Fast Processing' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', status: 'Direct Transfer' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', status: 'Pay on Delivery' }
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a> / 
          <a href="/help" className="breadcrumb-link">Help</a> / Payments
        </div>

        <div className="page-header">
          <h1 className="page-title">💳 Payment Methods & Security</h1>
          <p className="page-subtitle">
            Secure, fast, and convenient payment options for your shopping experience
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🔒</span>
            Accepted Payment Methods
          </h2>
          <div className="info-grid">
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                className={`info-card ${selectedPayment === method.id ? 'selected' : ''}`}
                onClick={() => setSelectedPayment(method.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{method.icon}</div>
                <h3>{method.name}</h3>
                <p>{method.status}</p>
                <span className="status-indicator status-success"></span>
                Available
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🛡️</span>
            Payment Security
          </h2>
          <div className="section-content">
            <div className="highlight-box">
              <h3>🔐 Your payment information is completely secure</h3>
              <p>We use industry-standard encryption and security measures to protect your financial data.</p>
            </div>
            <ul>
              <li><strong>SSL Encryption:</strong> All payment data is encrypted using 256-bit SSL</li>
              <li><strong>PCI DSS Compliant:</strong> We follow Payment Card Industry Data Security Standards</li>
              <li><strong>Secure Payment Gateway:</strong> Partnered with trusted payment processors</li>
              <li><strong>No Storage:</strong> We never store your complete card details</li>
              <li><strong>Two-Factor Authentication:</strong> Additional security layer for transactions</li>
            </ul>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">❓</span>
            Payment FAQs
          </h2>
          <div className="faq-item">
            <div className="faq-question">
              Is it safe to use my credit card on ShopSphere?
            </div>
            <div className="faq-answer">
              Yes, absolutely! We use bank-level security with SSL encryption and are PCI DSS compliant. Your card details are processed securely through our trusted payment partners.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              Why was my payment declined?
            </div>
            <div className="faq-answer">
              Payment declines can happen due to insufficient funds, incorrect card details, bank restrictions, or exceeding daily limits. Please verify your details and try again, or contact your bank.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              How long does it take for payments to process?
            </div>
            <div className="faq-answer">
              Most payments are processed instantly. UPI and card payments reflect immediately, while net banking may take 2-5 minutes during peak hours.
            </div>
          </div>
        </div>

        <div className="interactive-element">
          <h3>💬 Need Payment Help?</h3>
          <p>Our payment support team is available 24/7 to assist you</p>
          <button className="cta-button">Contact Payment Support</button>
          <button className="cta-button">Report Payment Issue</button>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📞</span>
            Payment Support Contact
          </h2>
          <div className="contact-info">
            <p><strong>24/7 Payment Helpline:</strong> 1800-XXX-XXXX (Toll Free)</p>
            <p><strong>Email Support:</strong> payments@shopsphere.com</p>
            <p><strong>Live Chat:</strong> Available on website and mobile app</p>
            <p><strong>Average Response Time:</strong> Under 2 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;