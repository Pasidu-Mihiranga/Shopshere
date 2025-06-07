import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-menu')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src="/images/Logo.png" alt="SHOPSPHERE" className="logo" />
          </Link>
        </div>

        {/* Desktop Search Section */}
        <div className="search-section desktop-search">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input 
              type="text" 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anything..." 
            />
            <button type="submit" className="search-button">
              <img src="/images/searchIcon.png" alt="Search" className="search-icon" />
            </button>
          </form>
        </div>

        {/* Right Section - Cart and Auth */}
        <div className="right-section">
          {/* Cart Icon */}
          <Link to="/cart" className="cart-link">

            <div  className="cartdiv">
              <div className="cart-container">
                <img src="/images/Cart.png" alt="Shopping Cart" className="cart-icon" />
                {cart.totalItems > 0 && (
                  <div className="cart-badge">{cart.totalItems}</div>
                )}
              </div>
            </div>
            
          </Link>

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="user-menu">
              <button 
                className="user-menu-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="username">{user.firstName}</span>
                <svg 
                  className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
                  width="16" 
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 15l-5-5h10l-5 5z"/>
                </svg>
              </button>
              
              <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                <Link 
                  to={user.userType === 'customer' ? '/dashboard' : '/seller-dashboard'}
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/orders" 
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Orders
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item logout-button"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login">
                <button className="login-button">Login</button>
              </Link>
              <Link to="/register">
                <button className="register-button">Register</button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Search Section */}
        <div className="search-section mobile-search">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input 
              type="text" 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anything..." 
            />
            <button type="submit" className="search-button">
              <img src="/images/searchIcon.png" alt="Search" className="search-icon" />
            </button>
          </form>
          
          {/* Mobile Cart */}
          <Link to="/cart" className="cart-link mobile-cart">
            <div>
                <div className="cart-container">
                <img src="/images/Cart.png" alt="Shopping Cart" className="cart-icon" />
                {cart.totalItems > 0 && (
                  <div className="cart-badge">{cart.totalItems}</div>
                )}
              </div>
            </div>
            
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;