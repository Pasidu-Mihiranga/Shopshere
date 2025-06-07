// src/pages/help/Cancellation.jsx
import React, { useState } from 'react';
import './CommonPages.css';

const Cancellation = () => {
  const [selectedReason, setSelectedReason] = useState('');
  const [orderStatus, setOrderStatus] = useState('confirmed');

  const cancellationReasons = [
    { id: 'change_mind', text: 'Changed my mind', icon: '🤔' },
    { id: 'wrong_item', text: 'Ordered wrong item/size/color', icon: '❌' },
    { id: 'better_price', text: 'Found better price elsewhere', icon: '💰' },
    { id: 'delivery_delay', text: 'Delivery taking too long', icon: '⏰' },
    { id: 'quality_concern', text: 'Quality concerns after reading reviews', icon: '⭐' },
    { id: 'duplicate_order', text: 'Accidentally placed duplicate order', icon: '🔄' },
    { id: 'payment_issue', text: 'Payment method issue', icon: '💳' },
    { id: 'other', text: 'Other reason', icon: '📝' }
  ];

  const orderStatuses = {
    confirmed: {
      name: 'Order Confirmed',
      cancellable: true,
      refundTime: 'Instant to wallet, 5-7 days to original payment',
      icon: '✅',
      color: '#27ae60'
    },
    packed: {
      name: 'Order Packed',
      cancellable: true,
      refundTime: '5-7 business days',
      icon: '📦',
      color: '#f39c12'
    },
    shipped: {
      name: 'Order Shipped',
      cancellable: false,
      refundTime: 'Return process required',
      icon: '🚚',
      color: '#e74c3c'
    },
    delivered: {
      name: 'Order Delivered',
      cancellable: false,
      refundTime: 'Return process required',
      icon: '✅',
      color: '#95a5a6'
    }
  };

  const cancellationFees = [
    { category: 'Electronics', fee: '0%', condition: 'Before dispatch' },
    { category: 'Fashion', fee: '0%', condition: 'Before dispatch' },
    { category: 'Books', fee: '0%', condition: 'Before dispatch' },
    { category: 'Home & Kitchen', fee: '2%', condition: 'After dispatch' },
    { category: 'Groceries', fee: 'Not cancellable', condition: 'After confirmation' }
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a> / 
          <a href="/help" className="breadcrumb-link">Help</a> / Cancellation
        </div>

        <div className="page-header">
          <h1 className="page-title">❌ Order Cancellation</h1>
          <p className="page-subtitle">
            Cancel your orders easily with instant refunds and no questions asked
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">⏱️</span>
            When Can You Cancel?
          </h2>
          <div className="info-grid">
            {Object.entries(orderStatuses).map(([key, status]) => (
              <div 
                key={key}
                className="info-card"
                style={{ 
                  background: status.cancellable 
                    ? 'linear-gradient(135deg, #27ae60, #2ecc71)' 
                    : 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  cursor: 'pointer'
                }}
                onClick={() => setOrderStatus(key)}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{status.icon}</div>
                <h3>{status.name}</h3>
                <p><strong>Cancellable:</strong> {status.cancellable ? 'Yes' : 'No'}</p>
                <p><strong>Refund:</strong> {status.refundTime}</p>
                {status.cancellable && (
                  <span className="status-indicator status-success"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">💸</span>
            Cancellation Fees
          </h2>
          <div className="section-content">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'white',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ background: '#FF5722', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Cancellation Fee</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellationFees.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '1rem' }}>{item.category}</td>
                      <td style={{ 
                        padding: '1rem',
                        color: item.fee === '0%' ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {item.fee}
                      </td>
                      <td style={{ padding: '1rem', color: '#7f8c8d' }}>{item.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🔄</span>
            How to Cancel Your Order
          </h2>
          <div className="section-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {[
                { step: 1, title: 'Go to My Orders', desc: 'Login and navigate to your orders section', icon: '📋' },
                { step: 2, title: 'Select Order', desc: 'Find the order you want to cancel', icon: '👆' },
                { step: 3, title: 'Click Cancel', desc: 'Choose the cancel order option', icon: '❌' },
                { step: 4, title: 'Select Reason', desc: 'Pick your cancellation reason', icon: '📝' },
                { step: 5, title: 'Confirm Cancellation', desc: 'Review and confirm your cancellation', icon: '✅' },
                { step: 6, title: 'Get Refund', desc: 'Receive instant refund confirmation', icon: '💰' }
              ].map((item) => (
                <div key={item.step} style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  textAlign: 'center'
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

        <div className="interactive-element">
          <h3>🚀 Quick Cancel Demo</h3>
          <p>Select a cancellation reason to see how easy it is:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
            {cancellationReasons.map((reason) => (
              <div 
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                style={{
                  padding: '1rem',
                  background: selectedReason === reason.id ? '#FF5722' : 'white',
                  color: selectedReason === reason.id ? 'white' : '#2c3e50',
                  border: '2px solid #FF5722',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{reason.icon}</div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{reason.text}</p>
              </div>
            ))}
          </div>
          {selectedReason && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1rem',
              borderRadius: '10px',
              marginTop: '1rem'
            }}>
              <p>✅ Reason selected! Your cancellation would be processed instantly with a full refund.</p>
              <button className="cta-button">Complete Cancellation</button>
            </div>
          )}
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">💳</span>
            Refund Information
          </h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>⚡ Instant Refund</h3>
              <p>ShopSphere Wallet</p>
              <p><strong>Time:</strong> Immediate</p>
              <span className="status-indicator status-success"></span>
              Recommended
            </div>
            <div className="info-card">
              <h3>🏦 Original Payment</h3>
              <p>Bank/Card refund</p>
              <p><strong>Time:</strong> 5-7 business days</p>
              <span className="status-indicator status-info"></span>
              Standard
            </div>
            <div className="info-card">
              <h3>🎁 Store Credit</h3>
              <p>110% of order value</p>
              <p><strong>Time:</strong> Immediate</p>
              <span className="status-indicator status-warning"></span>
              Bonus Value
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">❓</span>
            Cancellation FAQs
          </h2>
          <div className="faq-item">
            <div className="faq-question">
              Can I cancel part of my order?
            </div>
            <div className="faq-answer">
              Yes! You can cancel individual items from your order as long as they haven't been dispatched. Go to order details and select specific items to cancel.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              What if my order is already shipped?
            </div>
            <div className="faq-answer">
              Once shipped, you cannot cancel the order. However, you can refuse delivery and return the item, or use our easy return process after delivery.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              Will I be charged for cancellation?
            </div>
            <div className="faq-answer">
              Most cancellations are free if done before dispatch. Some categories may have minimal fees if cancelled after dispatch. Check our fee structure above.
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📞</span>
            Need Help Cancelling?
          </h2>
          <div className="contact-info">
            <p><strong>24/7 Cancellation Support:</strong> 1800-XXX-XXXX (Toll Free)</p>
            <p><strong>Email:</strong> cancellation@shopsphere.com</p>
            <p><strong>Live Chat:</strong> Available on website and mobile app</p>
            <p><strong>WhatsApp:</strong> Send "CANCEL ORDER_ID" to +91-XXXXX-XXXXX</p>
          </div>
        </div>

        <div className="highlight-box">
          <h3>🛡️ Cancellation Protection</h3>
          <div className="info-grid" style={{ marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h4>🔒 Secure Process</h4>
              <p>All cancellations are processed securely with order verification</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4>⚡ Instant Confirmation</h4>
              <p>Get immediate confirmation via SMS and email</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4>💰 Guaranteed Refund</h4>
              <p>100% refund guarantee for all eligible cancellations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cancellation;