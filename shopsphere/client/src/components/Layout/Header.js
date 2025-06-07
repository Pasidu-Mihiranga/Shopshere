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
      if (dropdownOpen && !event.target.closest('.shopsphere-user-menu')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="shopsphere-header">
      <div className="shopsphere-header-container">
        {/* Logo Section */}
        <div className="shopsphere-logo-section">
          <Link to="/" className="shopsphere-logo-link">
            <img src="/images/Logo.png" alt="SHOPSPHERE" className="shopsphere-logo" />
          </Link>
        </div>

        {/* Desktop Search Section */}
        <div className="shopsphere-search-section shopsphere-desktop-search">
          <form onSubmit={handleSearchSubmit} className="shopsphere-search-form">
            <input 
              type="text" 
              className="shopsphere-search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anything..." 
            />
            <button type="submit" className="shopsphere-search-button">
              <img src="/images/searchIcon.png" alt="Search" className="shopsphere-search-icon" />
            </button>
          </form>
        </div>

        {/* Right Section - Cart and Auth */}
        <div className="shopsphere-right-section">
          {/* Cart Icon */}
          <Link to="/cart" className="shopsphere-cart-link">

            <div  className="shopsphere-cartdiv">
              <div className="shopsphere-cart-container">
                <img src="/images/Cart.png" alt="Shopping Cart" className="shopsphere-cart-icon" />
                {cart.totalItems > 0 && (
                  <div className="shopsphere-cart-badge">{cart.totalItems}</div>
                )}
              </div>
            </div>
            
          </Link>

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="shopsphere-user-menu">
              <button 
                className="shopsphere-user-menu-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="shopsphere-username">{user.firstName}</span>
                <svg 
                  className={`shopsphere-dropdown-arrow ${dropdownOpen ? 'shopsphere-open' : ''}`}
                  width="16" 
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 15l-5-5h10l-5 5z"/>
                </svg>
              </button>
              
              <div className={`shopsphere-dropdown-menu ${dropdownOpen ? 'shopsphere-show' : ''}`}>
                <Link 
                  to={user.userType === 'customer' ? '/dashboard' : '/seller-dashboard'}
                  className="shopsphere-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="shopsphere-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/orders" 
                  className="shopsphere-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Orders
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="shopsphere-dropdown-item shopsphere-logout-button"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="shopsphere-auth-buttons">
              <Link to="/login">
                <button className="shopsphere-login-button">Login</button>
              </Link>
              <Link to="/register">
                <button className="shopsphere-register-button">Register</button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Search Section */}
        <div className="shopsphere-search-section shopsphere-mobile-search">
          <form onSubmit={handleSearchSubmit} className="shopsphere-search-form">
            <input 
              type="text" 
              className="shopsphere-search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anything..." 
            />
            <button type="submit" className="shopsphere-search-button">
              <img src="/images/searchIcon.png" alt="Search" className="shopsphere-search-icon" />
            </button>
          </form>
          
          {/* Mobile Cart */}
          <Link to="/cart" className="shopsphere-cart-link shopsphere-mobile-cart">
            <div>
                <div className="shopsphere-cart-container">
                <img src="/images/Cart.png" alt="Shopping Cart" className="shopsphere-cart-icon" />
                {cart.totalItems > 0 && (
                  <div className="shopsphere-cart-badge">{cart.totalItems}</div>
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