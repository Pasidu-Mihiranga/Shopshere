// src/pages/policy/Security.jsx
import React, { useState } from 'react';
import './CommonPages.css';

const Security = () => {
  const [securityTip, setSecurityTip] = useState(0);

  const securityFeatures = [
    {
      title: 'SSL Encryption',
      icon: '🔒',
      description: '256-bit SSL encryption for all data transmission',
      status: 'Active',
      level: 'Enterprise Grade'
    },
    {
      title: 'Two-Factor Authentication',
      icon: '🔐',
      description: 'Additional security layer for account protection',
      status: 'Available',
      level: 'Recommended'
    },
    {
      title: 'Secure Payment Gateway',
      icon: '💳',
      description: 'PCI DSS compliant payment processing',
      status: 'Certified',
      level: 'Bank Level'
    },
    {
      title: 'Data Encryption',
      icon: '🛡️',
      description: 'End-to-end encryption for sensitive information',
      status: 'Implemented',
      level: 'Military Grade'
    },
    {
      title: 'Fraud Detection',
      icon: '🕵️',
      description: 'AI-powered fraud prevention system',
      status: 'Real-time',
      level: 'Advanced'
    },
    {
      title: 'Regular Security Audits',
      icon: '🔍',
      description: 'Third-party security assessments',
      status: 'Quarterly',
      level: 'Professional'
    }
  ];

  const securityTips = [
    {
      title: 'Create Strong Passwords',
      icon: '🔑',
      tips: [
        'Use at least 12 characters',
        'Include uppercase, lowercase, numbers, and symbols',
        'Avoid personal information',
        'Use unique passwords for each account',
        'Consider using a password manager'
      ]
    },
    {
      title: 'Enable Two-Factor Authentication',
      icon: '📱',
      tips: [
        'Use authenticator apps like Google Authenticator',
        'Keep backup codes in a safe place',
        'Don\'t share OTP codes with anyone',
        'Use SMS 2FA as a backup option',
        'Update your phone number regularly'
      ]
    },
    {
      title: 'Safe Shopping Practices',
      icon: '🛒',
      tips: [
        'Always check the URL for HTTPS',
        'Never shop on public Wi-Fi',
        'Log out after shopping sessions',
        'Monitor your bank statements',
        'Report suspicious activities immediately'
      ]
    },
    {
      title: 'Account Security',
      icon: '👤',
      tips: [
        'Regular password updates',
        'Monitor login activity',
        'Don\'t share account credentials',
        'Use official apps and websites only',
        'Keep your email account secure'
      ]
    }
  ];

  const threatProtection = [
    {
      threat: 'Phishing Attacks',
      protection: 'Email verification & domain authentication',
      icon: '🎣',
      risk: 'High',
      prevention: 'Always verify sender authenticity'
    },
    {
      threat: 'Data Breaches',
      protection: 'Advanced encryption & access controls',
      icon: '💥',
      risk: 'Medium',
      prevention: 'Regular security audits & monitoring'
    },
    {
      threat: 'Identity Theft',
      protection: 'Multi-factor authentication & verification',
      icon: '🎭',
      risk: 'High',
      prevention: 'Strong authentication protocols'
    },
    {
      threat: 'Payment Fraud',
      protection: 'AI fraud detection & secure gateways',
      icon: '💰',
      risk: 'Medium',
      prevention: 'Real-time transaction monitoring'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a> / 
          <a href="/policy" className="breadcrumb-link">Consumer Policy</a> / Security
        </div>

        <div className="page-header">
          <h1 className="page-title">🔒 Security Policy</h1>
          <p className="page-subtitle">
            Your security is our top priority. Learn about our comprehensive security measures
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🛡️</span>
            Security Features
          </h2>
          <div className="info-grid">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="info-card">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <span className="status-indicator status-success"></span>
                  <small>{feature.status}</small>
                  <small style={{ color: '#FF5722', fontWeight: 'bold' }}>{feature.level}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">💡</span>
            Security Tips for Users
          </h2>
          <div className="info-grid">
            {securityTips.map((tip, index) => (
              <div 
                key={index}
                className={`info-card ${securityTip === index ? 'selected' : ''}`}
                onClick={() => setSecurityTip(index)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{tip.icon}</div>
                <h3>{tip.title}</h3>
                {securityTip === index && (
                  <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
                    {tip.tips.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>


        <div className="interactive-element">
          <h3>🔐 Security Health Check</h3>
          <p>Take our quick security assessment to improve your account security</p>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '2rem',
            borderRadius: '15px',
            margin: '2rem 0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <h4>✅ Password Strength</h4>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: '#27ae60', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  85%
                </div>
                <p>Strong</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4>📱 2FA Status</h4>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: '#e74c3c', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  ❌
                </div>
                <p>Not Enabled</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4>📧 Email Verified</h4>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: '#27ae60', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  ✓
                </div>
                <p>Verified</p>
              </div>
            </div>
            <button className="cta-button" style={{ marginTop: '1rem' }}>Improve Security Score</button>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">🚨</span>
            Report Security Issues
          </h2>
          <div className="section-content">
            <div className="highlight-box">
              <h3>🔍 Bug Bounty Program</h3>
              <p>We welcome responsible disclosure of security vulnerabilities. Report security issues and earn rewards for valid findings.</p>
              
              <h4>📝 How to Report</h4>
              <ul>
                <li>Email detailed report to security@shopsphere.com</li>
                <li>Include steps to reproduce the vulnerability</li>
                <li>Provide proof-of-concept if applicable</li>
                <li>Wait for acknowledgment before public disclosure</li>
              </ul>
              
             
            </div>
          </div>
        </div>

        

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📞</span>
            Security Support
          </h2>
          <div className="contact-info">
            <p><strong>Security Team:</strong> security@shopsphere.com</p>
            <p><strong>Emergency Hotline:</strong> 1800-XXX-XXXX (24/7)</p>
            <p><strong>Bug Bounty:</strong> bugbounty@shopsphere.com</p>
            <p><strong>Fraud Reporting:</strong> fraud@shopsphere.com</p>
            <p><strong>Response Time:</strong> Critical issues within 1 hour</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;