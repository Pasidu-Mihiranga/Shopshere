// src/pages/policy/Privacy.jsx
import React, { useState } from 'react';
import './CommonPages.css';

const Privacy = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [dataType, setDataType] = useState('personal');

  const privacySections = {
    overview: {
      title: 'Privacy Overview',
      icon: '🔒',
      content: (
        <div>
          <h3>Your Privacy Matters</h3>
          <p>This Privacy Policy explains how ShopSphere collects, uses, and protects your personal information when you use our services.</p>
          
          <div className="highlight-box">
            <h4>📋 Quick Summary</h4>
            <ul>
              <li>We collect information to provide better services</li>
              <li>Your data is encrypted and securely stored</li>
              <li>We never sell your personal information</li>
              <li>You have full control over your privacy settings</li>
              <li>We comply with all applicable privacy laws</li>
            </ul>
          </div>
          
          <h4>📅 Last Updated</h4>
          <p>This Privacy Policy was last updated on June 1, 2025. We may update this policy from time to time, and we'll notify you of any significant changes.</p>
          
          <h4>📞 Privacy Officer</h4>
          <p><strong>Contact:</strong> privacy@shopsphere.com<br/>
          <strong>Response Time:</strong> Within 7 business days</p>
        </div>
      )
    },
    collection: {
      title: 'Data Collection',
      icon: '📊',
      content: (
        <div>
          <h3>What Information We Collect</h3>
          
          <h4>👤 Personal Information</h4>
          <ul>
            <li><strong>Account Information:</strong> Name, email, phone number, date of birth</li>
            <li><strong>Profile Data:</strong> Profile picture, preferences, interests</li>
            <li><strong>Identity Verification:</strong> Government ID for high-value transactions</li>
            <li><strong>Contact Details:</strong> Shipping and billing addresses</li>
          </ul>
          
          <h4>💳 Financial Information</h4>
          <ul>
            <li><strong>Payment Data:</strong> Credit/debit card details (encrypted)</li>
            <li><strong>Transaction History:</strong> Purchase records and payment methods</li>
            <li><strong>Billing Information:</strong> Invoices and payment receipts</li>
          </ul>
          
          <h4>📱 Technical Information</h4>
          <ul>
            <li><strong>Device Data:</strong> Device type, operating system, browser information</li>
            <li><strong>Usage Analytics:</strong> Pages visited, time spent, click patterns</li>
            <li><strong>Location Data:</strong> IP address, GPS location (with permission)</li>
            <li><strong>Cookies:</strong> Preferences, session data, targeted advertising</li>
          </ul>
          
          <h4>🛒 Shopping Behavior</h4>
          <ul>
            <li><strong>Browse History:</strong> Products viewed and searched</li>
            <li><strong>Purchase Patterns:</strong> Buying frequency and preferences</li>
            <li><strong>Wishlist Data:</strong> Saved items and favorites</li>
            <li><strong>Reviews & Ratings:</strong> Product feedback and comments</li>
          </ul>
        </div>
      )
    },
    usage: {
      title: 'How We Use Data',
      icon: '🎯',
      content: (
        <div>
          <h3>How We Use Your Information</h3>
          
          <h4>🛍️ Service Provision</h4>
          <ul>
            <li>Process orders and handle payments</li>
            <li>Manage your account and provide customer support</li>
            <li>Deliver products and track shipments</li>
            <li>Handle returns, refunds, and exchanges</li>
          </ul>
          
          <h4>🎨 Personalization</h4>
          <ul>
            <li>Recommend products based on your interests</li>
            <li>Customize your shopping experience</li>
            <li>Show relevant advertisements and offers</li>
            <li>Provide personalized content and deals</li>
          </ul>
          
          <h4>📈 Analytics & Improvement</h4>
          <ul>
            <li>Analyze website usage and performance</li>
            <li>Improve our services and user experience</li>
            <li>Conduct market research and trend analysis</li>
            <li>Optimize our platform and mobile apps</li>
          </ul>
          
          <h4>📧 Communication</h4>
          <ul>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide customer support and service announcements</li>
            <li>Share promotional offers and newsletters (with consent)</li>
            <li>Conduct surveys and feedback collection</li>
          </ul>
          
          <h4>🛡️ Security & Compliance</h4>
          <ul>
            <li>Prevent fraud and unauthorized access</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Protect our platform and users from threats</li>
            <li>Resolve disputes and legal claims</li>
          </ul>
        </div>
      )
    },
    sharing: {
      title: 'Data Sharing',
      icon: '🤝',
      content: (
        <div>
          <h3>When We Share Your Information</h3>
          
          <div className="highlight-box">
            <h4>🚫 We Never Sell Your Data</h4>
            <p>ShopSphere does not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
          </div>
          
          <h4>🏢 Service Providers</h4>
          <ul>
            <li><strong>Payment Processors:</strong> Secure payment handling</li>
            <li><strong>Shipping Partners:</strong> Order delivery and tracking</li>
            <li><strong>Cloud Services:</strong> Data storage and platform hosting</li>
            <li><strong>Analytics Providers:</strong> Website performance and user insights</li>
          </ul>
          
          <h4>🛒 Sellers & Vendors</h4>
          <ul>
            <li>Order details for fulfillment (name, address, phone)</li>
            <li>Product reviews and ratings (anonymized when possible)</li>
            <li>Return and refund information as necessary</li>
          </ul>
          
          <h4>⚖️ Legal Requirements</h4>
          <ul>
            <li>Government agencies for tax and regulatory compliance</li>
            <li>Law enforcement when required by valid legal process</li>
            <li>Courts and legal proceedings as mandated</li>
            <li>Regulatory bodies for industry compliance</li>
          </ul>
          
          <h4>🔄 Business Transfers</h4>
          <ul>
            <li>Mergers, acquisitions, or asset sales (with notification)</li>
            <li>Bankruptcy or restructuring proceedings</li>
            <li>Corporate reorganization or partnership changes</li>
          </ul>
        </div>
      )
    },
    rights: {
      title: 'Your Rights',
      icon: '⚖️',
      content: (
        <div>
          <h3>Your Privacy Rights</h3>
          
          <h4>👁️ Access Rights</h4>
          <ul>
            <li>View all personal data we have about you</li>
            <li>Download your data in a portable format</li>
            <li>Get information about how your data is used</li>
            <li>See who we've shared your data with</li>
          </ul>
          
          <h4>✏️ Correction Rights</h4>
          <ul>
            <li>Update or correct your personal information</li>
            <li>Modify your communication preferences</li>
            <li>Change your privacy settings</li>
            <li>Update payment and address information</li>
          </ul>
          
          <h4>🗑️ Deletion Rights</h4>
          <ul>
            <li>Request deletion of your personal data</li>
            <li>Remove specific information from your profile</li>
            <li>Delete your account permanently</li>
            <li>Opt-out of data processing activities</li>
          </ul>
          
          <h4>🛑 Control Rights</h4>
          <ul>
            <li>Object to certain data processing</li>
            <li>Restrict how we use your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Manage cookie and tracking preferences</li>
          </ul>
          
          <div className="contact-info">
            <strong>Exercise Your Rights:</strong><br/>
            Email: privacy@shopsphere.com<br/>
            Subject: "Privacy Rights Request"<br/>
            Include: Your registered email and specific request
          </div>
        </div>
      )
    },
    security: {
      title: 'Data Security',
      icon: '🛡️',
      content: (
        <div>
          <h3>How We Protect Your Data</h3>
          
          <h4>🔒 Technical Safeguards</h4>
          <ul>
            <li><strong>Encryption:</strong> 256-bit SSL encryption for data transmission</li>
            <li><strong>Storage Security:</strong> Encrypted databases with access controls</li>
            <li><strong>Network Security:</strong> Firewalls and intrusion detection systems</li>
            <li><strong>Regular Updates:</strong> Security patches and system updates</li>
          </ul>
          
          <h4>👥 Administrative Controls</h4>
          <ul>
            <li><strong>Access Limitation:</strong> Need-to-know basis for employee access</li>
            <li><strong>Background Checks:</strong> Screening for all personnel</li>
            <li><strong>Training:</strong> Regular privacy and security training</li>
            <li><strong>Audit Trails:</strong> Monitoring and logging of data access</li>
          </ul>
          
          <h4>🏢 Physical Security</h4>
          <ul>
            <li><strong>Secure Facilities:</strong> Restricted access to data centers</li>
            <li><strong>Surveillance:</strong> 24/7 monitoring and security systems</li>
            <li><strong>Environmental Controls:</strong> Climate and power protection</li>
            <li><strong>Disposal:</strong> Secure destruction of physical media</li>
          </ul>
          
          <h4>📋 Compliance Standards</h4>
          <ul>
            <li><strong>ISO 27001:</strong> Information security management</li>
            <li><strong>SOC 2:</strong> Security and availability controls</li>
            <li><strong>PCI DSS:</strong> Payment card data protection</li>
            <li><strong>GDPR Ready:</strong> European privacy regulation compliance</li>
          </ul>
          
          <div className="highlight-box">
            <h4>🚨 Data Breach Response</h4>
            <p>In the unlikely event of a data breach, we will notify affected users within 72 hours and take immediate action to secure the system and investigate the incident.</p>
          </div>
        </div>
      )
    }
  };

  const dataTypes = {
    personal: {
      name: 'Personal Data',
      items: ['Name', 'Email', 'Phone', 'Address', 'Date of Birth'],
      purpose: 'Account management and communication',
      retention: '3 years after account closure',
      icon: '👤'
    },
    financial: {
      name: 'Financial Data',
      items: ['Payment methods', 'Transaction history', 'Billing info'],
      purpose: 'Payment processing and fraud prevention',
      retention: '7 years for tax compliance',
      icon: '💳'
    },
    behavioral: {
      name: 'Behavioral Data',
      items: ['Search history', 'Purchase patterns', 'Site usage'],
      purpose: 'Personalization and recommendations',
      retention: '2 years from last activity',
      icon: '📊'
    },
    technical: {
      name: 'Technical Data',
      items: ['IP address', 'Device info', 'Cookies', 'Log files'],
      purpose: 'Platform optimization and security',
      retention: '1 year from collection',
      icon: '💻'
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a> / 
          <a href="/policy" className="breadcrumb-link">Consumer Policy</a> / Privacy Policy
        </div>

        <div className="page-header">
          <h1 className="page-title">🔒 Privacy Policy</h1>
          <p className="page-subtitle">
            Transparent information about how we collect, use, and protect your personal data
          </p>
          <div style={{ 
            background: 'rgba(255, 87, 34, 0.1)',
            padding: '1rem',
            borderRadius: '10px',
            marginTop: '1rem',
            border: '1px solid #FF5722'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>Effective Date:</strong> June 1, 2025 | <strong>Version:</strong> 3.2
            </p>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            Privacy Topics
          </h2>
          <div className="info-grid">
            {Object.entries(privacySections).map(([key, section]) => (
              <div 
                key={key}
                className={`info-card ${activeSection === key ? 'selected' : ''}`}
                onClick={() => setActiveSection(key)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{section.icon}</div>
                <h3>{section.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">{privacySections[activeSection].icon}</span>
            {privacySections[activeSection].title}
          </h2>
          <div className="section-content">
            {privacySections[activeSection].content}
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Data Categories & Retention
          </h2>
          <div className="info-grid">
            {Object.entries(dataTypes).map(([key, data]) => (
              <div 
                key={key}
                className={`info-card ${dataType === key ? 'selected' : ''}`}
                onClick={() => setDataType(key)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{data.icon}</div>
                <h3>{data.name}</h3>
                {dataType === key && (
                  <div style={{ textAlign: 'left', marginTop: '1rem' }}>
                    <p><strong>Includes:</strong></p>
                    <ul style={{ fontSize: '0.9rem' }}>
                      {data.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <p><strong>Purpose:</strong> {data.purpose}</p>
                    <p><strong>Retention:</strong> {data.retention}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="interactive-element">
          <h3>🎛️ Privacy Dashboard</h3>
          <p>Manage your privacy settings and data preferences</p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            margin: '2rem 0'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h4>📧 Email Preferences</h4>
              <div style={{ 
                width: '40px', 
                height: '20px', 
                background: '#27ae60', 
                borderRadius: '10px', 
                margin: '1rem auto',
                position: 'relative'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  right: '1px',
                  top: '1px'
                }}></div>
              </div>
              <p>Marketing emails enabled</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h4>🍪 Cookie Settings</h4>
              <div style={{ 
                width: '40px', 
                height: '20px', 
                background: '#e74c3c', 
                borderRadius: '10px', 
                margin: '1rem auto',
                position: 'relative'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  left: '1px',
                  top: '1px'
                }}></div>
              </div>
              <p>Tracking cookies disabled</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h4>📱 SMS Notifications</h4>
              <div style={{ 
                width: '40px', 
                height: '20px', 
                background: '#27ae60', 
                borderRadius: '10px', 
                margin: '1rem auto',
                position: 'relative'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  right: '1px',
                  top: '1px'
                }}></div>
              </div>
              <p>Order updates enabled</p>
            </div>
          </div>
          <button className="cta-button">Manage All Privacy Settings</button>
        </div>

      

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">👶</span>
            Children's Privacy
          </h2>
          <div className="highlight-box">
            <h3>🔞 Age Restrictions</h3>
            <p>ShopSphere is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
            
            <h4>🛡️ Parental Controls</h4>
            <ul>
              <li>Parents can request deletion of their child's data</li>
              <li>We verify parental consent for users 13-18 years old</li>
              <li>Special protection for sensitive categories of data</li>
              <li>Educational resources about online safety</li>
            </ul>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            <span className="section-icon">📞</span>
            Privacy Support
          </h2>
          <div className="contact-info">
            <p><strong>Privacy Officer:</strong> privacy@shopsphere.com</p>
            <p><strong>Data Protection Officer:</strong> dpo@shopsphere.com</p>
            <p><strong>Privacy Hotline:</strong> +94-XXX-XXXX</p>
            <p><strong>Postal Address:</strong> Privacy Team, ShopSphere Technologies Pvt. Ltd., 123 Tech Park, colombo</p>
            <p><strong>Response Time:</strong> Privacy requests processed within 7 business days</p>
          </div>
        </div>

        {/* <div className="interactive-element">
          <h3>📋 Quick Actions</h3>
          <p>Common privacy-related requests</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="cta-button">📥 Download My Data</button>
            <button className="cta-button">✏️ Update Privacy Settings</button>
            <button className="cta-button">🗑️ Delete My Account</button>
            <button className="cta-button">📧 Contact Privacy Team</button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Privacy;