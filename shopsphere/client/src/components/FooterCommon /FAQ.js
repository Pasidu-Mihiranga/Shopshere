// src/pages/help/FAQ.jsx
import React, { useState } from 'react';
import './CommonPages.css';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqCategories = {
    general: {
      name: 'General',
      icon: '❓',
      questions: [
        {
          q: "What is ShopSphere?",
          a: "ShopSphere is India's leading e-commerce platform offering millions of products across various categories with fast delivery, easy returns, and secure payments."
        },
        {
          q: "How do I create an account?",
          a: "Click on 'Register' in the top right corner, fill in your details, verify your email/phone, and you're ready to shop!"
        },
        {
          q: "Is shopping on ShopSphere safe?",
          a: "Absolutely! We use advanced security measures, SSL encryption, and secure payment gateways to protect your data and transactions."
        },
        {
          q: "Do you have a mobile app?",
          a: "Yes! Download our mobile app from Play Store or App Store for a seamless shopping experience with exclusive app-only deals."
        }
      ]
    },
    orders: {
      name: 'Orders',
      icon: '📦',
      questions: [
        {
          q: "How can I track my order?",
          a: "Go to 'My Orders' section, click on the order you want to track, or use our tracking tool with your order ID. You'll also receive SMS/email updates."
        },
        {
          q: "Can I modify my order after placing it?",
          a: "Order modifications are possible only before dispatch. Contact customer support immediately for changes to address, items, or cancellation."
        },
        {
          q: "What if I receive a damaged product?",
          a: "Take photos of the damaged item and packaging, then contact customer support within 48 hours. We'll arrange immediate replacement or refund."
        },
        {
          q: "How long does delivery take?",
          a: "Delivery time varies by location: Metro cities (1-2 days), Tier 1 cities (2-3 days), Tier 2 cities (3-5 days), Rural areas (5-7 days)."
        }
      ]
    },
    payments: {
      name: 'Payments',
      icon: '💳',
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept Credit/Debit cards, UPI, Net Banking, Digital Wallets (Paytm, PhonePe, etc.), and Cash on Delivery (COD)."
        },
        {
          q: "Is my payment information secure?",
          a: "Yes! We use 256-bit SSL encryption and are PCI DSS compliant. We never store your complete card details on our servers."
        },
        {
          q: "Why was my payment declined?",
          a: "Common reasons include insufficient funds, incorrect details, bank restrictions, or daily limits. Verify details and try again, or contact your bank."
        },
        {
          q: "When will I be charged for my order?",
          a: "Payment is processed immediately upon order confirmation for all online payments. For COD, payment is collected at delivery."
        }
      ]
    },
    returns: {
      name: 'Returns & Refunds',
      icon: '🔄',
      questions: [
        {
          q: "How do I return a product?",
          a: "Go to 'My Orders', select the item to return, choose reason, and schedule free pickup. Our team will collect the item from your address."
        },
        {
          q: "How long does refund take?",
          a: "Refunds are processed within 5-7 business days for cards/bank accounts, or instantly to ShopSphere wallet after return approval."
        },
        {
          q: "What items cannot be returned?",
          a: "Perishable goods, personalized items, digital downloads, opened hygiene products, gift cards, and items damaged by misuse cannot be returned."
        },
        {
          q: "Do I need to pay for return shipping?",
          a: "No! We provide free return pickup from your doorstep for all eligible returns. You can also drop off at our partner locations."
        }
      ]
    },
    account: {
      name: 'Account & Profile',
      icon: '👤',
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on login page, enter your email/phone, and follow the reset link sent to you. You can also use OTP verification."
        },
        {
          q: "Can I change my registered email/phone?",
          a: "Yes, go to 'My Profile' settings, verify your identity, and update your contact information. You'll need to verify the new details."
        },
        {
          q: "How do I delete my account?",
          a: "Contact customer support to delete your account. Please note this action is irreversible and you'll lose order history and wallet balance."
        },
        {
          q: "Why can't I log into my account?",
          a: "Check your credentials, ensure caps lock is off, or try password reset. If issue persists, contact support - your account might be temporarily locked."
        }
      ]
    }
  };

  const toggleFAQ = (categoryKey, questionIndex) => {
    const faqKey = `${categoryKey}-${questionIndex}`;
    setOpenFAQ(openFAQ === faqKey ? null : faqKey);
  };

  const filteredFAQs = Object.entries(faqCategories).reduce((acc, [key, category]) => {
    const filteredQuestions = category.questions.filter(
      faq => 
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredQuestions.length > 0 || activeCategory === key) {
      acc[key] = { ...category, questions: filteredQuestions };
    }
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a> / 
          <a href="/help" className="breadcrumb-link">Help</a> / FAQ
        </div>

        <div className="page-header">
          <h1 className="page-title">❓ Frequently Asked Questions</h1>
          <p className="page-subtitle">
            Find quick answers to common questions about shopping on ShopSphere
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🔍</span>
            Search FAQs
          </h2>
          <div className="interactive-element">
            <input 
              type="text"
              placeholder="Search for your question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '1rem 1.5rem',
                fontSize: '1.1rem',
                border: '2px solid #ddd',
                borderRadius: '50px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF5722'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <p style={{ marginTop: '1rem', opacity: 0.8 }}>
              Can't find what you're looking for? <a href="#contact" style={{ color: '#FF5722' }}>Contact Support</a>
            </p>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📂</span>
            FAQ Categories
          </h2>
          <div className="info-grid">
            {Object.entries(faqCategories).map(([key, category]) => (
              <div 
                key={key}
                className={`info-card ${activeCategory === key ? 'selected' : ''}`}
                onClick={() => setActiveCategory(key)}
                style={{ 
                  cursor: 'pointer',
                  transform: activeCategory === key ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.questions.length} Questions</p>
              </div>
            ))}
          </div>
        </div>

        {searchTerm ? (
          <div className="content-section">
            <h2 className="section-title">
              <span className="section-icon">🔍</span>
              Search Results for "{searchTerm}"
            </h2>
            {Object.entries(filteredFAQs).map(([categoryKey, category]) => (
              category.questions.length > 0 && (
                <div key={categoryKey}>
                  <h3 style={{ color: '#FF5722', marginBottom: '1rem' }}>
                    {category.icon} {category.name}
                  </h3>
                  {category.questions.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <div 
                        className="faq-question"
                        onClick={() => toggleFAQ(categoryKey, index)}
                      >
                        {faq.q}
                        <span style={{ fontSize: '1.2rem' }}>
                          {openFAQ === `${categoryKey}-${index}` ? '−' : '+'}
                        </span>
                      </div>
                      {openFAQ === `${categoryKey}-${index}` && (
                        <div className="faq-answer">{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="content-section">
            <h2 className="section-title">
              <span className="section-icon">{faqCategories[activeCategory].icon}</span>
              {faqCategories[activeCategory].name} Questions
            </h2>
            {faqCategories[activeCategory].questions.map((faq, index) => (
              <div key={index} className="faq-item">
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(activeCategory, index)}
                >
                  {faq.q}
                  <span style={{ fontSize: '1.2rem' }}>
                    {openFAQ === `${activeCategory}-${index}` ? '−' : '+'}
                  </span>
                </div>
                {openFAQ === `${activeCategory}-${index}` && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Popular Questions This Week
          </h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>🏆 #1 Most Asked</h3>
              <p>"How can I track my order?"</p>
              <small>Asked 2,847 times this week</small>
            </div>
            <div className="info-card">
              <h3>🥈 #2 Most Asked</h3>
              <p>"What payment methods do you accept?"</p>
              <small>Asked 1,923 times this week</small>
            </div>
            <div className="info-card">
              <h3>🥉 #3 Most Asked</h3>
              <p>"How do I return a product?"</p>
              <small>Asked 1,677 times this week</small>
            </div>
          </div>
        </div>

        <div className="interactive-element" id="contact">
          <h3>🤝 Still Need Help?</h3>
          <p>Our customer support team is available 24/7 to assist you</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="cta-button">💬 Live Chat</button>
            <button className="cta-button">📞 Call Support</button>
            <button className="cta-button">📧 Email Us</button>
            <button className="cta-button">📱 WhatsApp</button>
          </div>
          <div className="contact-info" style={{ marginTop: '2rem' }}>
            <p><strong>24/7 Helpline:</strong> 1800-XXX-XXXX (Toll Free)</p>
            <p><strong>Email:</strong> support@shopsphere.com</p>
            <p><strong>Average Response Time:</strong> Under 2 minutes</p>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">💡</span>
            Quick Tips
          </h2>
          <div className="section-content">
            <div className="info-grid">
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px'
              }}>
                <h4>💳 Payment Tips</h4>
                <p>Save cards securely for faster checkout and enable 2FA for extra security</p>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px'
              }}>
                <h4>📦 Order Tips</h4>
                <p>Double-check delivery address and phone number to avoid delivery delays</p>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px'
              }}>
                <h4>🔄 Return Tips</h4>
                <p>Keep original packaging for easy returns and take photos if item is damaged</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;