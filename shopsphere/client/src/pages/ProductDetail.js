import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        
        // Initialize selected attributes
        if (response.data.attributes) {
          const initialAttributes = {};
          Object.entries(response.data.attributes).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              initialAttributes[key] = value[0];
            } else if (typeof value === 'object') {
              const options = Object.keys(value);
              if (options.length > 0) {
                initialAttributes[key] = options[0];
              }
            }
          });
          setSelectedAttributes(initialAttributes);
        }
        
        // Reset selected image index when product changes
        setSelectedImage(0);
        setQuantity(1);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      
      try {
        const response = await axios.get(`/api/products?category=${product.category}&limit=4&exclude=${product._id}`);
        setRelatedProducts(response.data.products);
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    };
    
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);
  
  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory?.quantity || 10)) {
      setQuantity(newQuantity);
    }
  };
  
  // Handle attribute selection
  const handleAttributeChange = (attribute, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attribute]: value
    }));
  };
  
  // Add to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedAttributes);
      
      // Show toast notification
      // ...
    }
  };
  
  // Buy now
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };
  
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
        <p>Loading product details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="error-container">
        <p>Product not found.</p>
        <Link to="/products" className="back-to-products">
          Back to Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="product-detail-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span className="separator">/</span>
        <Link to="/products">Products</Link>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>
      
      <div className="product-detail-container">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={product.images && product.images.length > 0 
                ? product.images[selectedImage] 
                : '/images/placeholder-product.png'} 
              alt={product.name} 
            />
            {product.salePrice && (
              <span className="discount-badge">
                {calculateDiscount(product.price, product.salePrice)}% OFF
              </span>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-gallery">
              {product.images.map((image, index) => (
                <button 
                  key={index}
                  className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} - view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          
          <div className="product-meta">
            <div className="product-rating">
              <div className="stars" style={{ '--rating': product.rating || 0 }}></div>
              <span className="reviews-count">({product.reviews?.length || 0} Reviews)</span>
            </div>
            
            <div className="product-sku">
              SKU: <span>{product.inventory?.sku || 'N/A'}</span>
            </div>
          </div>
          
          <div className="product-price">
            {product.salePrice ? (
              <>
                <span className="sale-price">{formatPrice(product.salePrice)}</span>
                <span className="original-price">{formatPrice(product.price)}</span>
                <span className="discount-text">Save {calculateDiscount(product.price, product.salePrice)}%</span>
              </>
            ) : (
              <span className="regular-price">{formatPrice(product.price)}</span>
            )}
          </div>
          
          <div className="product-short-description">
            <p>{product.description}</p>
          </div>
          
          {/* Product Attributes */}
          {product.attributes && Object.entries(product.attributes).length > 0 && (
            <div className="product-attributes">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="attribute-group">
                  <h3 className="attribute-name">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                  <div className="attribute-options">
                    {Array.isArray(value) ? (
                      // Text options
                      value.map((option) => (
                        <button
                          key={option}
                          className={`attribute-option ${selectedAttributes[key] === option ? 'selected' : ''}`}
                          onClick={() => handleAttributeChange(key, option)}
                        >
                          {option}
                        </button>
                      ))
                    ) : typeof value === 'object' ? (
                      // Color options
                      Object.entries(value).map(([colorName, colorCode]) => (
                        <button
                          key={colorName}
                          className={`color-option ${selectedAttributes[key] === colorName ? 'selected' : ''}`}
                          style={{ backgroundColor: colorCode }}
                          onClick={() => handleAttributeChange(key, colorName)}
                          title={colorName}
                        >
                          {selectedAttributes[key] === colorName && <span className="check-mark">✓</span>}
                        </button>
                      ))
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="quantity-selector">
            <h3>Quantity</h3>
            <div className="quantity-controls">
              <button 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                value={quantity}
                readOnly
              />
              <button 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.inventory?.quantity || 10)}
              >
                +
              </button>
            </div>
            <div className="stock-status">
              {product.inventory?.quantity > 0 ? (
                <span className="in-stock">In Stock ({product.inventory.quantity} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>
          </div>
          
          {/* Add to Cart & Buy Now */}
          <div className="product-actions">
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.inventory?.quantity <= 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/>
              </svg>
              Add to Cart
            </button>
            <button 
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.inventory?.quantity <= 0}
            >
              Buy Now
            </button>
          </div>
          
          {/* Shop Info */}
          <div className="shop-info">
            <div className="shop-name">
              Sold by: <a href={`/shop/${product.shopId}`}>{product.shopName || 'ShopSphere Merchant'}</a>
            </div>
            
            <div className="delivery-info">
              <div className="delivery-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M8.965 18a3.5 3.5 0 0 1-6.93 0H1V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2h3l3 4.056V18h-2.035a3.5 3.5 0 0 1-6.93 0h-5.07zm-5 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm14 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor"/>
                </svg>
              </div>
              <div className="delivery-text">
                <span className="delivery-title">Free Delivery</span>
                <span className="delivery-detail">2-3 business days</span>
              </div>
            </div>
            
            <div className="delivery-info">
              <div className="delivery-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z" fill="currentColor"/>
                </svg>
              </div>
              <div className="delivery-text">
                <span className="delivery-title">Returns Policy</span>
                <span className="delivery-detail">30 days easy returns</span>
              </div>
            </div>
          </div>
          
          {/* Secure Checkout */}
          <div className="secure-checkout">
            <div className="secure-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 1 1 14 0v1zm-2 0V9A5 5 0 0 0 7 9v1h10zm-6 4v4h2v-4h-2z" fill="currentColor"/>
              </svg>
            </div>
            <span>Secure Checkout</span>
          </div>
          
          {/* Payment Methods */}
          <div className="payment-methods">
            <span className="payment-method">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                <rect width="40" height="24" rx="4" fill="#fff"/>
                <path d="M13 10h3v7h-3z" fill="#213f99"/>
                <path d="M13 7h3v2h-3z" fill="#213f99"/>
                <path d="M24 10h3v7h-3z" fill="#213f99"/>
                <path d="M16 14c0-2 2-2 2-2h2v-2h-2s-4 0-4 4 4 4 4 4h2v-2h-2s-2 0-2-2z" fill="#213f99"/>
              </svg>
            </span>
            <span className="payment-method">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                <rect width="40" height="24" rx="4" fill="#fff"/>
                <path d="M10 8h5v8h-5z" fill="#ff5f00"/>
                <path d="M11 12a5 5 0 0 1 1.9-4H10v8h2.9a5 5 0 0 1-1.9-4z" fill="#eb001b"/>
                <path d="M30 12a5 5 0 0 1-8 4h2.9v-8H22a5 5 0 0 1 8 4z" fill="#f79e1b"/>
              </svg>
            </span>
            <span className="payment-method">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                <rect width="40" height="24" rx="4" fill="#fff"/>
                <path d="M29 8H11c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h18c.6 0 1-.4 1-1V9c0-.6-.4-1-1-1z" fill="#FCB941"/>
                <path d="M12 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="#FFF"/>
                <path d="M24 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="#FFF"/>
              </svg>
            </span>
            <span className="payment-method">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 40 24">
                <rect width="40" height="24" rx="4" fill="#fff"/>
                <path d="M24 7H14v10h10V7z" fill="#006FCF"/>
                <path d="M18 10l-1 2-1-2h-1l1.5 3L15 16h1l1-2 1 2h1l-1.5-3L19 10h-1z" fill="#FFF"/>
                <path d="M24 10h-1l-1 3-1-3h-1l1.5 4h1l1.5-4z" fill="#FFF"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      {/* Product Tabs */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviews?.length || 0})
          </button>
        </div>
        
        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <div className="product-description">
                {product.longDescription || product.description}
              </div>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="tab-pane">
              <div className="product-specifications">
                <table>
                  <tbody>
                    <tr>
                      <th>Brand</th>
                      <td>{product.brand || 'Generic'}</td>
                    </tr>
                    <tr>
                      <th>Model</th>
                      <td>{product.model || 'Standard'}</td>
                    </tr>
                    <tr>
                      <th>Weight</th>
                      <td>{product.weight ? `${product.weight} kg` : 'Not specified'}</td>
                    </tr>
                    <tr>
                      <th>Dimensions</th>
                      <td>{product.dimensions || 'Not specified'}</td>
                    </tr>
                    <tr>
                      <th>Warranty</th>
                      <td>{product.warranty || 'Standard manufacturer warranty'}</td>
                    </tr>
                    <tr>
                      <th>In Box</th>
                      <td>{product.inBox || 'Product and manual'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="tab-pane">
              <div className="product-reviews">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="reviews-list">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <div className="reviewer">
                            <div className="avatar">
                              {review.user?.firstName?.charAt(0) || 'U'}
                            </div>
                            <div className="name">
                              {review.user?.firstName || 'Anonymous'} {review.user?.lastName || ''}
                            </div>
                          </div>
                          <div className="review-rating">
                            <div className="stars" style={{ '--rating': review.rating }}></div>
                            <span className="date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews">
                    <p>This product has no reviews yet. Be the first to review it!</p>
                    <button className="write-review-btn">Write a Review</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-products-grid">
            {relatedProducts.map(product => (
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;