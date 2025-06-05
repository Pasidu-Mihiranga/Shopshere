// src/components/Product/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './ProductCard.css'; 

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };


  // Add this line to construct the full image URL
  const imageUrl = product.images && product.images[0] 
    ? `http://localhost:5000${product.images[0]}` 
    : '/images/placeholder.png';
  
  
  return (
    <div className="product-card"
      // style={{ 
      //     width: '300px', 
          
      //   }}
    >
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image"
        style={{ 
          width: '100%', 
          height: '350px', 
          overflow: 'hidden',
          backgroundColor: '#f5f5f5'
        }}>
          <img 
            src={imageUrl}  /* Use imageUrl instead of product.images[0] */
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />
          {product.isPromoted && <span className="product-badge">Sale</span>}
        </div>
        <div className="product-info"
         style={{ 
          width: '100%', 
          height: '', 
          overflow: 'hidden',
          backgroundColor: '#f5f5f5'
        }}>
          <div 
            style={{ 
            fontSize: '24px',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            color: 'black'
        }}
          >
            {product.name}</div>
          <div className="product-price"
            style={{ 
            fontSize: '18px',
        }}
          >
            {product.salePrice ? (
              <>
                <span className="original-price">${product.price.toFixed(2)}</span>
                <span className="sale-price">${product.salePrice.toFixed(2)}</span>
              </>
            ) : (
              <span>${product.price.toFixed(2)}</span>
            )}
          </div>
          <button 
        className='addcartbtn'
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
        </div>
      </Link>
      
    </div>
  );
};

export default ProductCard;