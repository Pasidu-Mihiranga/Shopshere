import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Add scroll event listener to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Prevent body scrolling when menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  return (
    <div className="layout">
      <Header 
        isScrolled={isScrolled} 
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={toggleMobileMenu}
        />
      )}
      
      <main className={`main-content ${isMobileMenuOpen ? 'blur' : ''}`}>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      
      <Footer />
      
      {/* Back to top button */}
      <button 
        className={`back-to-top ${isScrolled ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
    </div>
  );
};

export default Layout;