import React from "react";
import "./AboutUs.css";



const AboutUs = () => {
  return (
    <>
    
      <div className="about-wrapper">
        <div className="about-header">
          <h1>About US</h1>
          <p>
            Your trusted global marketplace for buying and selling products
            online.
          </p>
        </div>

        <div className="about-us-container">
          <section className="about-section">
            <div className="section-icon">
              <i className="fas fa-globe"></i>
            </div>
            <h2>Who We Are</h2>
            <p>
              Founded in 2020, ShopSphere is a leading online marketplace
              connecting buyers and sellers across the globe. Similar to
              platforms like eBay and Daraz, we provide a secure and
              user-friendly environment where individuals and businesses can
              discover, buy, and sell products across countless categories.
            </p>
            <p>
              With millions of active users and sellers from over 30 countries,
              ShopSphere has quickly grown into one of the most trusted
              e-commerce platforms in the region, offering everything from
              electronics and fashion to home goods and collectibles.
            </p>
          </section>

          <section className="about-section">
            <div className="section-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <h2>Our Mission</h2>
            <p>
              At ShopSphere, our mission is to create an inclusive global
              marketplace where anyone can buy and sell with confidence. We
              strive to break down geographical barriers, empower small
              businesses, and provide consumers with access to a vast selection
              of products at competitive prices.
            </p>
            <p>
              We believe in democratizing commerce, creating economic
              opportunities, and fostering a community where entrepreneurs can
              thrive and consumers can discover products that meet their needs,
              wants, and budgets.
            </p>
          </section>

          <section className="about-section">
            <div className="section-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h2>Security Features</h2>
            <ul className="features-list">
              <li>
                <strong>Secure Payment Processing:</strong> All transactions are
                processed through our encrypted payment gateway, supporting
                multiple payment methods including credit cards, digital
                wallets, and bank transfers.
              </li>
              <li>
                <strong>Buyer Protection Program:</strong> Shop with confidence
                knowing you're covered by our comprehensive buyer protection
                policy for eligible purchases.
              </li>
              <li>
                <strong>Seller Verification:</strong> We verify seller
                identities and monitor performance to maintain platform
                integrity.
              </li>
              <li>
                <strong>Fraud Detection Systems:</strong> Advanced AI-powered
                systems continuously monitor for suspicious activities to
                prevent fraud.
              </li>
              <li>
                <strong>Data Protection:</strong> Your personal and financial
                information is protected with industry-standard encryption and
                security protocols.
              </li>
            </ul>
          </section>

          <section className="about-section">
            <div className="section-icon">
              <i className="fas fa-headset"></i>
            </div>
            <h2>Customer Care</h2>
            <ul className="features-list">
              <li>
                <strong>24/7 Support:</strong> Our dedicated customer service
                team is available around the clock to assist you with any issues
                or questions.
              </li>
              <li>
                <strong>Dispute Resolution:</strong> Fair and transparent
                process to resolve any disputes between buyers and sellers.
              </li>
              <li>
                <strong>Live Chat Support:</strong> Get immediate assistance
                through our live chat feature directly on the website and mobile
                app.
              </li>
              <li>
                <strong>Comprehensive Help Center:</strong> Access detailed
                guides, FAQs, and tutorials to help you navigate our platform.
              </li>
              <li>
                <strong>Community Forums:</strong> Connect with other users,
                share experiences, and get advice from our vibrant community.
              </li>
            </ul>
          </section>

          <section className="about-section values-section">
            <div className="section-icon">
              <i className="fas fa-star"></i>
            </div>
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>Trust</h3>
                <p>
                  We build trust through transparent practices and reliable
                  service.
                </p>
              </div>
              <div className="value-card">
                <h3>Innovation</h3>
                <p>
                  We continuously improve our platform with cutting-edge
                  technology.
                </p>
              </div>
              <div className="value-card">
                <h3>Inclusion</h3>
                <p>
                  We create opportunities for businesses of all sizes across the
                  globe.
                </p>
              </div>
              <div className="value-card">
                <h3>Excellence</h3>
                <p>We strive for excellence in every aspect of our service.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-number">10M+</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5M+</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">30+</span>
            <span className="stat-label">Countries</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support</span>
          </div>
        </div>

        <div className="about-us-footer">
          <p>
            Join millions of satisfied users who trust ShopSphere for their
            online shopping needs.
          </p>
          <div className="cta-buttons">
            <a href="/shop" className="cta-button">
              Start Shopping
            </a>
            <a href="/sell" className="cta-button secondary">
              Become a Seller
            </a>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default AboutUs;
