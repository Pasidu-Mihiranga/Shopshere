import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get('/api/wishlist');
        setWishlistItems(response.data);
        setError('');
      } catch (error) {
        setError('Failed to fetch wishlist items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/wishlist/${productId}`);
      setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
      setError('');
    } catch (error) {
      setError('Failed to remove item from wishlist');
    }
  };

  const moveToCart = async (item) => {
    try {
      // Add to cart
      await addToCart(
        {
          _id: item.productId,
          name: item.name,
          price: item.salePrice || item.price,
          images: [item.image]
        }, 
        1
      );
      
      // Remove from wishlist
      await removeFromWishlist(item.productId);
      
      setError('');
    } catch (error) {
      setError('Failed to move item to cart');
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await axios.delete('/api/wishlist');
        setWishlistItems([]);
        setError('');
      } catch (error) {
        setError('Failed to clear wishlist');
      }
    }
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h2>My Wishlist</h2>
        {wishlistItems.length > 0 && (
          <button 
            className="btn-secondary"
            onClick={clearWishlist}
          >
            Clear Wishlist
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is empty</p>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="wishlist-items">
          {wishlistItems.map(item => (
            <div key={item.productId} className="wishlist-item">
              <div className="item-image">
                <Link to={`/products/${item.productId}`}>
                  <img 
                    src={item.image || '/images/placeholder.png'} 
                    alt={item.name} 
                  />
                </Link>
              </div>
              
              <div className="item-details">
                <Link to={`/products/${item.productId}`} className="item-name">
                  {item.name}
                </Link>
                
                <div className="item-price">
                  {item.salePrice ? (
                    <>
                      <span className="original-price">${item.price.toFixed(2)}</span>
                      <span className="sale-price">${item.salePrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span>${item.price.toFixed(2)}</span>
                  )}
                </div>
                
                {item.inStock ? (
                  <span className="in-stock">In Stock</span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
                
                <div className="item-added">
                  Added on {new Date(item.addedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="item-actions">
                <button 
                  className="btn-primary"
                  onClick={() => moveToCart(item)}
                  disabled={!item.inStock}
                >
                  {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                <button 
                  className="btn-text"
                  onClick={() => removeFromWishlist(item.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {wishlistItems.length > 0 && (
        <div className="wishlist-footer">
          <p>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
          <div className="action-buttons">
            <Link to="/products" className="btn-secondary">Continue Shopping</Link>
            {wishlistItems.some(item => item.inStock) && (
              <button 
                className="btn-primary"
                onClick={() => {
                  // Add all in-stock items to cart
                  wishlistItems
                    .filter(item => item.inStock)
                    .forEach(item => moveToCart(item));
                }}
              >
                Add All to Cart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;