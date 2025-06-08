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
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setProductsLoading(true);
        
        // Fetch all data in parallel
        const [flashSaleRes, featuredRes, categoriesRes] = await Promise.all([
          axios.get('/api/products?isPromoted=true&limit=4'),
          axios.get('/api/products?limit=8'), 
          axios.get('/api/categories?limit=5')
        ]);

        console.log('✅ Products response:', featuredRes.data);
        console.log('✅ Categories response:', categoriesRes.data);

        setFlashSaleProducts(flashSaleRes.data.products || []);
        
        // Handle different response structures for products
        if (featuredRes.data && featuredRes.data.products) {
          setFeaturedProducts(featuredRes.data.products);
        } else if (Array.isArray(featuredRes.data)) {
          setFeaturedProducts(featuredRes.data);
        } else {
          setFeaturedProducts([]);
        }
        
        // Handle different response structures for categories
        if (categoriesRes.data && categoriesRes.data.categories) {
          setCategories(categoriesRes.data.categories);
        } else if (Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data);
        } else {
          setCategories([]);
        }
        setError(null);
        setProductsError(null);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load content. Please try again later.');
        setProductsError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
        setProductsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Format currency
  const formatPrice = (price) => {
    return `${price.toFixed(2)}`;
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
      <FlashSaleAd/>
      
      {/* Categories Section */}
      <section className="category-showcase">
        <div className="section-header">
          <h2>Explore Popular Categories</h2>
          <Link to="/categories" className="view-all">View All</Link>
        </div>
        <div className="category-grid-container">
          {categories.map(category => (
            <Link 
              key={category._id} 
              to={`/products?category=${category._id}`}
              className="category-square-card"
            >
              <div className="category-square-icon">
                {category.name === 'Electronics' && (
                  <span className="icon-electronics">
                    <img src="/images/Electronics.png" alt="Electronics" className="shopsphere-logo" />
                  </span>
                )}
                {category.name === 'Clothing' && (
                  <span className="icon-clothing">
                    <img src="/images/Clothing.png" alt="Clothing" className="shopsphere-logo" />
                  </span>
                )}
                {category.name === 'Books' && (
                  <span className="icon-books">
                    <img src="/images/Books.png" alt="Books" className="shopsphere-logo" />
                  </span>
                )}
                {category.name === 'Home & Garden' && (
                  <span className="icon-home-garden">
                    <img src="/images/HomeandGarden.png" alt="H&G" className="shopsphere-logo" />
                  </span>
                )}
                {category.name === 'Sports' && (
                  <span className="icon-sports">
                    <img src="/images/Sports.png" alt="Sports" className="shopsphere-logo" />
                  </span>
                )}
                {!['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'].includes(category.name) && (
                  <span className="icon-general">
                    <img src="/images/General.png" alt="General" className="shopsphere-logo" />
                  </span>
                )}
              </div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Our Products Section */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2>Our Products</h2>
          <Link to="/products" className="view-all">View All</Link>
        </div>
        
        {productsLoading && (
          <div className="loading-state">
            <p>Loading products...</p>
          </div>
        )}
        
        {productsError && (
          <div className="error-state">
            <p style={{color: 'red', textAlign: 'center'}}>{productsError}</p>
          </div>
        )}
        
        {!productsLoading && !productsError && featuredProducts.length === 0 && (
          <div className="empty-state">
            <p style={{textAlign: 'center'}}>No products available at the moment.</p>
          </div>
        )}
        
        {!productsLoading && !productsError && featuredProducts.length > 0 && (
          <div className="products-showcase-grid">
            {featuredProducts.map(product => (
              <Link 
                key={product._id} 
                to={`/products/${product._id}`}
                className="product-showcase-card"
              >
                <div className="product-showcase-image">
                  <img 
                    src={product.images && product.images.length > 0 
                      ? product.images[0] 
                      : '/images/placeholder-product.png'} 
                    alt={product.name} 
                  />
                  {product.salePrice && (
                    <span className="product-discount-badge">
                      {calculateDiscount(product.price, product.salePrice)}% OFF
                    </span>
                  )}
                </div>
                <div className="product-showcase-info">
                  <h3 className="product-showcase-name">{product.name}</h3>
                  <div className="product-showcase-price">
                    {product.salePrice ? (
                      <>
                        <span className="product-sale-price">{formatPrice(product.salePrice)}</span>
                        <span className="product-original-price">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span className="product-regular-price">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
                <button className="product-add-to-cart-btn">Add to Cart</button>
              </Link>
            ))}
          </div>
        )}
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
            <span className="promo-icon">
              <img src="/images/Newarrivals.png" alt="NewArrivals" className="shopsphere-logo" />
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature">
          <div className="feature-icon">
            <img src="/images/FreeShipping.png" alt="Freeshipping"  />
          </div>
          <h3>Free Shipping</h3>
          <p>On orders over $50</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <img src="/images/EasyReturns.png" alt="EasyReturns"  />
          </div>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <img src="/images/SecurePayment.png" alt="SecurePayment"  />
          </div>
          <h3>Secure Payment</h3>
          <p>100% secure checkout</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <img src="/images/Support.png" alt="Support" />
          </div>
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