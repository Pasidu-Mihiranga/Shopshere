import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import FlashSaleAd from "../components/FlashSaleAd/FlashSaleAd";


const Home = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [flashSaleRes, featuredRes, categoriesRes] = await Promise.all([
          axios.get('/api/products?isPromoted=true&limit=4'),
          axios.get('/api/products?sort=popular&limit=8'),
          axios.get('/api/categories?limit=5')
        ]);

        setFlashSaleProducts(flashSaleRes.data.products);
        setFeaturedProducts(featuredRes.data.products);
        setCategories(categoriesRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Format currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  // Calculate discount percentage
  const calculateDiscount = (price, salePrice) => {
    return Math.round((1 - salePrice / price) * 100);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing deals...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Banner */}
      {/* <section className="hero-banner">
      
        <div className="hero-content">
          <h1>Flash Sale: Limited Time Offers You Can't Resist!</h1>
          <p>Unlock amazing savings on top-rated items - hurry, these deals won't last!</p>
          <Link to="/flash-sale" className="hero-button">Shop Now</Link>
        </div>
      </section> */}
      <FlashSaleAd/>
      {/* {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )} */}

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Explore Popular Categories</h2>
          <Link to="/categories" className="view-all">View All</Link>
        </div>
        <div className="categories-grid">
          {categories.map(category => (
            <Link 
              key={category._id} 
              to={`/products?category=${category._id}`}
              className="category-card"
            >
              <div className="category-icon">
                {category.name === 'Fashion' && (
                  <span className="icon-fashion">👕</span>
                )}
                {category.name === 'Electronics' && (
                  <span className="icon-electronics">📱</span>
                )}
                {category.name === 'Cosmetics' && (
                  <span className="icon-cosmetics">💄</span>
                )}
                {category.name === 'Footwear' && (
                  <span className="icon-footwear">👟</span>
                )}
                {category.name === 'Accessories' && (
                  <span className="icon-accessories">👜</span>
                )}
                {!['Fashion', 'Electronics', 'Cosmetics', 'Footwear', 'Accessories'].includes(category.name) && (
                  <span className="icon-general">🛍️</span>
                )}
              </div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="flash-sale-section">
        <div className="section-header">
          <h2>Flash Sale</h2>
          <div className="timer">
            <div className="time-unit">
              <span className="time-value">12</span>
              <span className="time-label">Hours</span>
            </div>
            <div className="time-separator">:</div>
            <div className="time-unit">
              <span className="time-value">34</span>
              <span className="time-label">Minutes</span>
            </div>
            <div className="time-separator">:</div>
            <div className="time-unit">
              <span className="time-value">56</span>
              <span className="time-label">Seconds</span>
            </div>
          </div>
        </div>
        <div className="products-grid">
          {flashSaleProducts.map(product => (
            <Link 
              key={product._id} 
              to={`/products/${product._id}`}
              className="product-card"
            >
              <div className="product-image">
                <img 
                  src={product.images && product.images.length > 0 
                    ? product.images[0] 
                    : '/images/placeholder-product.png'} 
                  alt={product.name} 
                />
                {product.salePrice && (
                  <span className="discount-badge">
                    {calculateDiscount(product.price, product.salePrice)}% OFF
                  </span>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                  {product.salePrice ? (
                    <>
                      <span className="sale-price">{formatPrice(product.salePrice)}</span>
                      <span className="original-price">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="regular-price">{formatPrice(product.price)}</span>
                  )}
                </div>
                <div className="product-rating">
                  <div className="stars" style={{ '--rating': product.rating || 0 }}></div>
                  <span>({product.reviews?.length || 0})</span>
                </div>
              </div>
              <button className="add-to-cart">Add to Cart</button>
            </Link>
          ))}
        </div>
        <div className="view-more-container">
          <Link to="/flash-sale" className="view-more-button">View More</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">View All</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <Link 
              key={product._id} 
              to={`/products/${product._id}`}
              className="product-card"
            >
              <div className="product-image">
                <img 
                  src={product.images && product.images.length > 0 
                    ? product.images[0] 
                    : '/images/placeholder-product.png'} 
                  alt={product.name} 
                />
                {product.salePrice && (
                  <span className="discount-badge">
                    {calculateDiscount(product.price, product.salePrice)}% OFF
                  </span>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                  {product.salePrice ? (
                    <>
                      <span className="sale-price">{formatPrice(product.salePrice)}</span>
                      <span className="original-price">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="regular-price">{formatPrice(product.price)}</span>
                  )}
                </div>
                <div className="product-rating">
                  <div className="stars" style={{ '--rating': product.rating || 0 }}></div>
                  <span>({product.reviews?.length || 0})</span>
                </div>
              </div>
              <button className="add-to-cart">Add to Cart</button>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="promotional-banners">
        <div className="promo-banner">
          <div className="promo-content">
            <h3>New Arrivals</h3>
            <p>Check out our latest collections</p>
            <Link to="/products?sort=newest" className="promo-button">Shop Now</Link>
          </div>
          <div className="promo-image" style={{ backgroundColor: '#f8d7da' }}>
            <span className="promo-icon">🆕</span>
          </div>
        </div>
        <div className="promo-banner">
          <div className="promo-content">
            <h3>Best Sellers</h3>
            <p>Our most popular products</p>
            <Link to="/products?sort=popular" className="promo-button">Shop Now</Link>
          </div>
          <div className="promo-image" style={{ backgroundColor: '#d1ecf1' }}>
            <span className="promo-icon">🏆</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature">
          <div className="feature-icon">🚚</div>
          <h3>Free Shipping</h3>
          <p>On orders over $50</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔄</div>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Secure Payment</h3>
          <p>100% secure checkout</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💬</div>
          <h3>24/7 Support</h3>
          <p>We're here to help</p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get the latest updates on new products and upcoming sales</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;