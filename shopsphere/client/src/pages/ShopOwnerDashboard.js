import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ProductManagement from '../components/ShopOwnerDashboard/PromotionManagement';
import OrderManagement from '../components/ShopOwnerDashboard/OrderManagement';
import PromotionManagement from '../components/ShopOwnerDashboard/PromotionManagement';
import Analytics from '../components/ShopOwnerDashboard/Analytics';
import ShopSettings from '../components/ShopOwnerDashboard/ShopSettings';
import './ShopOwnerDashboard.css';

const ShopOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('analytics');
  const [shopStats, setShopStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
    totalCustomers: 0
  });
  const [shopInfo, setShopInfo] = useState({
    shopName: '',
    logo: '',
    isVerified: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname.split('/');
    const currentTab = path[path.length - 1];
    
    if (currentTab === 'seller-dashboard') {
      setActiveTab('analytics');
    } else {
      setActiveTab(currentTab);
    }
  }, [location.pathname]);
  
  // Fetch shop stats and info
  useEffect(() => {
    const fetchShopData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [statsResponse, shopResponse] = await Promise.all([
          axios.get('/api/shop/stats'),
          axios.get('/api/shop/info')
        ]);
        
        setShopStats(statsResponse.data);
        setShopInfo(shopResponse.data);
        setError('');
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setError('Failed to load shop data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopData();
  }, [user]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Redirect if not logged in or not a shop owner
  if (!user) {
    navigate('/login?redirect=seller-dashboard');
    return null;
  }
  
  if (user && user.userType !== 'shop_owner') {
    navigate('/dashboard');
    return null;
  }
  
  return (
    <div className="seller-dashboard-page">
      <div className="page-header">
        <h1>Shop Dashboard</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="shop-profile-card">
            <div className="shop-logo">
              {shopInfo.logo ? (
                <img src={shopInfo.logo} alt={`${shopInfo.shopName} logo`} />
              ) : (
                <div className="logo-placeholder">
                  {shopInfo.shopName ? shopInfo.shopName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              {shopInfo.isVerified && (
                <div className="verified-badge" title="Verified Shop">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="shop-info">
              <h2>{shopInfo.shopName || 'My Shop'}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">${shopStats.totalSales.toLocaleString()}</div>
              <div className="stat-label">Total Sales</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{shopStats.pendingOrders}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{shopStats.totalProducts}</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{shopStats.totalCustomers}</div>
              <div className="stat-label">Customers</div>
            </div>
          </div>
          
          <nav className="dashboard-nav">
            <Link 
              to="/seller-dashboard" 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M5 3v16h16v2H3V3h2zm15.293 3.293l1.414 1.414L16 13.414l-3-2.999-4.293 4.292-1.414-1.414L13 7.586l3 2.999 4.293-4.292z" fill="currentColor"/>
                </svg>
              </div>
              <span>Analytics</span>
            </Link>
            
            <Link 
              to="/seller-dashboard/products" 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M22 20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v16zm-11-5H4v4h7v-4zm9 0h-7v4h7v-4zm-9-5H4v3h7v-3zm9 0h-7v3h7v-3zm-9-5H4v3h7V5zm9 0h-7v3h7V5z" fill="currentColor"/>
                </svg>
              </div>
              <span>Products</span>
            </Link>
            
            <Link 
              to="/seller-dashboard/orders" 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M9 2.003V2h10.998C20.55 2 21 2.455 21 2.992v18.016a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 20.993V8l6-5.997zM5.83 8H9V4.83L5.83 8zM11 4v5a1 1 0 0 1-1 1H5v10h14V4h-8z" fill="currentColor"/>
                </svg>
              </div>
              <span>Orders</span>
              {shopStats.pendingOrders > 0 && (
                <span className="badge">{shopStats.pendingOrders}</span>
              )}
            </Link>
            
            <Link 
              to="/seller-dashboard/promotions" 
              className={`nav-item ${activeTab === 'promotions' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M14.957 5.793l3.25 3.25-1.414 1.414-3.25-3.25-9.707 9.707-1.414-1.414 9.707-9.707-3.25-3.25 1.414-1.414 3.25 3.25L22 2.586 21.414 2l-6.457 3.793zm-1.39 10.59A8.001 8.001 0 0 1 4.07 6.887l9.498 9.497zm-8.468-8.468A8.001 8.001 0 0 0 15.513 17.5L5.632 7.619z" fill="currentColor"/>
                </svg>
              </div>
              <span>Promotions</span>
            </Link>
            
            <Link 
              to="/seller-dashboard/settings" 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M3.34 17a10.018 10.018 0 0 1-.978-2.326 3 3 0 0 0 .002-5.347A9.99 9.99 0 0 1 4.865 4.99a3 3 0 0 0 4.631-2.674 9.99 9.99 0 0 1 5.007.002 3 3 0 0 0 4.632 2.672c.579.59 1.093 1.261 1.525 2.01.433.749.757 1.53.978 2.326a3 3 0 0 0-.002 5.347 9.99 9.99 0 0 1-2.501 4.337 3 3 0 0 0-4.631 2.674 9.99 9.99 0 0 1-5.007-.002 3 3 0 0 0-4.632-2.672A10.018 10.018 0 0 1 3.34 17zm5.66.196a4.993 4.993 0 0 1 2.25 2.77c.499.047 1 .048 1.499.001a4.993 4.993 0 0 1 2.25-2.77 4.993 4.993 0 0 1 3.525-.564c.29-.408.54-.843.748-1.298A4.993 4.993 0 0 1 18 12c0-1.26-.47-2.437-1.278-3.334a4.993 4.993 0 0 1-.748-1.298 4.993 4.993 0 0 1-3.525-.563 4.993 4.993 0 0 1-2.25 2.77c-.499.047-1 .048-1.499.001a4.993 4.993 0 0 1-2.25-2.77 4.993 4.993 0 0 1-3.525.564c-.29.408-.54.843-.748 1.298A4.993 4.993 0 0 1 6 12c0 1.26.47 2.437 1.278 3.334.207.455.457.89.748 1.298a4.993 4.993 0 0 1 3.525.563zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/>
                </svg>
              </div>
              <span>Settings</span>
            </Link>
            
            <button 
              className="nav-item logout-button"
              onClick={handleLogout}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5zm10-6l5-4-5-4v3H9v2h6v3z" fill="currentColor"/>
                </svg>
              </div>
              <span>Logout</span>
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<Analytics />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/promotions" element={<PromotionManagement />} />
            <Route path="/settings" element={<ShopSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;