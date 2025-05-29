// src/components/Product/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image">
          <img 
            src={product.images[0] || '/images/placeholder.png'} 
            alt={product.name} 
          />
          {product.isPromoted && <span className="product-badge">Sale</span>}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">
            {product.salePrice ? (
              <>
                <span className="original-price">${product.price.toFixed(2)}</span>
                <span className="sale-price">${product.salePrice.toFixed(2)}</span>
              </>
            ) : (
              <span>${product.price.toFixed(2)}</span>
            )}
          </div>
          <div className="product-rating">
            {/* Display star rating here */}
            <span className="rating-value">{product.rating}</span>
          </div>
        </div>
      </Link>
      <button 
        className="add-to-cart-btn"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;