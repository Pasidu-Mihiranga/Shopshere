import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

const Header = ({ isScrolled, isMobileMenuOpen, toggleMobileMenu }) => {
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
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img src="/images/logo.jpg" alt="SHOPSPHERE" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search for anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Navigation - Desktop */}
        <nav className={`navigation ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/products" 
            className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}
          >
            Products
          </Link>
          
          <Link 
            to="/categories" 
            className={`nav-link ${location.pathname.startsWith('/categories') ? 'active' : ''}`}
          >
            Categories
          </Link>
          
          <Link 
            to="/flash-sale" 
            className={`nav-link ${location.pathname.startsWith('/flash-sale') ? 'active' : ''}`}
          >
            Flash Sale
          </Link>
          
          <Link to="/cart" className="cart-icon-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/>
            </svg>
            {cart.totalItems > 0 && (
              <span className="cart-badge">{cart.totalItems}</span>
            )}
          </Link>
          
          {user ? (
            <div className="user-menu">
              <button 
                className="user-menu-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="username">{user.firstName}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="16" 
                  height="16"
                  className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
                >
                  <path d="M12 15l-5-5h10l-5 5z" fill="currentColor"/>
                </svg>
              </button>
              
              <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                <Link 
                  to={user.userType === 'customer' ? '/dashboard' : '/seller-dashboard'}
                  className="dropdown-item"
                >
                  Dashboard
                </Link>
                <Link to="/profile" className="dropdown-item">
                  Profile
                </Link>
                <Link to="/orders" className="dropdown-item">
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
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;