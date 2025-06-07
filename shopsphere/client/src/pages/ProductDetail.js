import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // ✅ Added this import
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth(); // ✅ Added this to get user state

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // ✅ Moved to proper location

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-product.png';
    return `http://localhost:5000${imagePath}`;
  };

  // Single useEffect to handle all data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching product with ID: ${id}`);

        // Fetch main product
        const productResponse = await axios.get(`http://localhost:5000/api/products/shop/${id}`);
        console.log('Full API response:', productResponse.data);

        if (!productResponse.data) {
          throw new Error('No product data received');
        }

        const productData = productResponse.data.product;

        // ✅ Access data directly from API response, not from state
        console.log('Product name from API response:', productData.name);
        console.log('Product description from API response:', productData.description);
        console.log('Product price from API response:', productData.price);
        console.log('Product category from API response:', productData.category);

        // Set product state
        setProduct(productData);

        // Initialize selected attributes using productData (not product state)
        if (productData.attributes && Object.keys(productData.attributes).length > 0) {
          const initialAttributes = {};
          Object.entries(productData.attributes).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              initialAttributes[key] = value[0];
            } else if (typeof value === 'object' && value !== null) {
              const options = Object.keys(value);
              if (options.length > 0) {
                initialAttributes[key] = options[0];
              }
            }
          });
          setSelectedAttributes(initialAttributes);
          console.log('Initialized attributes:', initialAttributes);
        } else {
          console.log('No attributes found for this product');
          setSelectedAttributes({});
        }

        // Fetch related products if we have category info
        if (productData.category && productData._id) {
          try {
            console.log('Fetching related products for category:', productData.category);
            const relatedResponse = await axios.get(
              `http://localhost:5000/api/products?category=${productData.category}&limit=4&exclude=${productData._id}`
            );
            console.log('Related products response:', relatedResponse.data);
            setRelatedProducts(relatedResponse.data.products || []);
          } catch (relatedErr) {
            console.error('Error fetching related products:', relatedErr);
            // Don't set error state for related products failure
          }
        }

        // Reset UI states
        setSelectedImage(0);
        setQuantity(1);
        setError(null);

      } catch (err) {
        console.error('Error fetching product details:', err);
        console.error('Error response:', err.response?.data);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

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

  // Enhanced Add to cart function
  const handleAddToCart = async () => {
    // Validation checks
    if (!product) {
      alert('Product not found');
      return;
    }

    if (quantity < 1 || quantity > (product.inventory?.quantity || 10)) {
      alert('Invalid quantity selected');
      return;
    }

    // Check if out of stock
    if (product.inventory?.quantity <= 0) {
      alert('This product is out of stock');
      return;
    }

    try {
      setIsAddingToCart(true);
      
      console.log('Adding to cart:', {
        product: product.name,
        productId: product._id,
        quantity,
        attributes: selectedAttributes,
        user: user ? 'authenticated' : 'guest' // ✅ Now user is properly imported
      });

      // Call the addToCart function from context
      await addToCart(product, quantity, selectedAttributes);
      
      console.log('Successfully added to cart');
      
      // Optional: Show success message
      // You can replace this with a toast notification
      alert(`${product.name} added to cart successfully!`);
      
      // Optional: Reset quantity to 1 after adding
      // setQuantity(1);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to add item to cart. Please try again.';
      
      alert(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Buy now
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  // Format currency - Fixed to not divide by 100
  const formatPrice = (price) => {
    if (typeof price !== 'number') return '0.00';
    return price.toFixed(2);
  };

  // Calculate discount percentage
  const calculateDiscount = (price, salePrice) => {
    if (!price || !salePrice) return 0;
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
                ? getImageUrl(product.images[selectedImage])
                : '/images/placeholder-product.png'}
              alt={product.name}
              onError={(e) => {
                console.log('Main image failed to load:', e.target.src);
                e.target.src = '/images/placeholder-product.png';
              }}
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
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.name} - view ${index + 1}`}
                    onError={(e) => {
                      console.log('Thumbnail failed to load:', e.target.src);
                      e.target.src = '/images/placeholder-product.png';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>

          <div className="product-meta">
            <div className="product-sku">
              SKU: <span>{product.inventory?.sku || 'N/A'}</span>
            </div>
          </div>

          <div className="product-price">
            {product.salePrice ? (
              <>
                <span className="sale-price">${formatPrice(product.salePrice)}</span>
                <span className="original-price">${formatPrice(product.price)}</span>
                <span className="discount-text">Save {calculateDiscount(product.price, product.salePrice)}%</span>
              </>
            ) : (
              <span className="regular-price">${formatPrice(product.price)}</span>
            )}
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
                    ) : typeof value === 'object' && value !== null ? (
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
          <div className="quantity-s">
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
              disabled={product.inventory?.quantity <= 0 || isAddingToCart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor" />
              </svg>
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
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
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M8.965 18a3.5 3.5 0 0 1-6.93 0H1V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2h3l3 4.056V18h-2.035a3.5 3.5 0 0 1-6.93 0h-5.07zm-5 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm14 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor" />
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
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z" fill="currentColor" />
                </svg>
              </div>
              <div className="delivery-text">
                <span className="delivery-title">Returns Policy</span>
                <span className="delivery-detail">30 days easy returns</span>
              </div>
            </div>
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

      {/* Related Products - Updated with new class names */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2 className="related-section-title">You May Also Like</h2>
          <div className="related-items-grid">
            {relatedProducts.map(relatedProduct => (
              <Link
                key={relatedProduct._id}
                to={`/products/${relatedProduct._id}`}
                className="related-item-card"
              >
                <div className="related-item-image">
                  <img
                    src={relatedProduct.images && relatedProduct.images.length > 0
                      ? getImageUrl(relatedProduct.images[0])
                      : '/images/placeholder-product.png'}
                    alt={relatedProduct.name}
                    onError={(e) => {
                      console.log('Related product image failed to load:', e.target.src);
                      e.target.src = '/images/placeholder-product.png';
                    }}
                  />
                  {relatedProduct.salePrice && (
                    <span className="related-discount-badge">
                      {calculateDiscount(relatedProduct.price, relatedProduct.salePrice)}% OFF
                    </span>
                  )}
                </div>
                <div className="related-item-info">
                  <h3 className="related-item-name">{relatedProduct.name}</h3>
                  <div className="related-item-price">
                    {relatedProduct.salePrice ? (
                      <>
                        <span className="related-item-sale-price">${formatPrice(relatedProduct.salePrice)}</span>
                        <span className="related-item-original-price">${formatPrice(relatedProduct.price)}</span>
                      </>
                    ) : (
                      <span className="related-item-regular-price">${formatPrice(relatedProduct.price)}</span>
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