// src/pages/ShopOwnerDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductManagement from '../components/ShopOwnerDashboard/ProductManagement';
import OrderManagement from '../components/ShopOwnerDashboard/OrderManagement';
import ShopSettings from '../components/ShopOwnerDashboard/ShopSettings';
import './ShopOwnerDashboard.css';

const ShopOwnerDashboard = () => {
  const { user, logout, apiClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('analytics');
  const [shopStats, setShopStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
    totalCustomers: 0,
    activePromotions: 0,
    lowStockProducts: 0
  });
  const [shopInfo, setShopInfo] = useState({
    shopName: '',
    logo: '',
    isVerified: false,
    createdAt: null
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Debug logs
  console.log('ShopOwnerDashboard - User:', user);
  console.log('ShopOwnerDashboard - Location:', location.pathname);
  
  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname.split('/');
    const currentTab = path[path.length - 1];
    
    console.log('Setting active tab to:', currentTab);
    
    if (currentTab === 'seller-dashboard') {
      setActiveTab('products');
    } else {
      setActiveTab(currentTab);
    }
  }, [location.pathname]);
  
  // Fetch shop stats and info
  useEffect(() => {
    const fetchShopData = async () => {
      if (!user || user.userType !== 'shop_owner') return;
      
      try {
        setStatsLoading(true);
        console.log('Fetching shop data...');
        
        // Try to fetch stats and info, but make them optional
        const promises = [];
        
        // Shop stats - optional
        promises.push(
          apiClient.get('/api/shop/stats').catch(error => {
            console.warn('Could not fetch shop stats:', error.message);
            return { data: shopStats }; // Return default stats
          })
        );
        
        // Shop info - optional
        promises.push(
          apiClient.get('/api/shop/info').catch(error => {
            console.warn('Could not fetch shop info:', error.message);
            return { 
              data: {
                shopName: user.firstName ? `${user.firstName}'s Shop` : 'My Shop',
                logo: '',
                isVerified: false,
                createdAt: new Date()
              }
            };
          })
        );
        
        const [statsResponse, shopResponse] = await Promise.all(promises);
        
        setShopStats(prevStats => ({
          ...prevStats,
          ...statsResponse.data
        }));
        
        setShopInfo(prevInfo => ({
          ...prevInfo,
          ...shopResponse.data
        }));
        
        console.log('Shop data loaded successfully');
        setError('');
      } catch (err) {
        console.error('Error fetching shop data:', err);
        // Don't show error for optional data
        // setError('Failed to load some shop data');
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchShopData();
  }, [user, apiClient]);
  
  // Handle logout
  const handleLogout = () => {
    console.log('Shop owner logging out...');
    logout();
    navigate('/');
  };
  
  // Redirect logic is now handled by ProtectedRoute, but keep as safety net
  if (!user) {
    console.log('No user in ShopOwnerDashboard, redirecting...');
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading user data...
      </div>
    );
  }
  
  if (user.userType !== 'shop_owner') {
    console.log('User is not a shop owner, redirecting to customer dashboard...');
    navigate('/dashboard');
    return null;
  }
  
  return (
    <div className="seller-dashboard-page">
      <div className="page-header">
        <h1>Shop Dashboard</h1>
        <p>Welcome back, {user.firstName}!</p>
      </div>
      
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee',
          color: '#c00',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}
      
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="shop-profile-card">
            <div className="shop-logo">
              {shopInfo.logo ? (
                <img 
                  src={shopInfo.logo} 
                  alt={`${shopInfo.shopName} logo`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="logo-placeholder"
                style={{
                  display: shopInfo.logo ? 'none' : 'flex',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#F15A24',
                  color: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  position: 'relative'
                }}
              >
                {shopInfo.shopName ? shopInfo.shopName.charAt(0).toUpperCase() : 'S'}
                {shopInfo.isVerified && (
                  <div 
                    className="verified-badge" 
                    title="Verified Shop"
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: '#4CAF50',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12">
                      <path fill="none" d="M0 0h24v24H0z"/>
                      <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" fill="white"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="shop-info">
              <h2>{shopInfo.shopName || `${user.firstName}'s Shop`}</h2>
              <p>{user.email}</p>
              <small>Shop Owner Account</small>
              {shopInfo.createdAt && (
                <small>Member since {new Date(shopInfo.createdAt).getFullYear()}</small>
              )}
            </div>
          </div>
          
          
          
          <nav className="dashboard-nav">
            
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
              {shopStats.lowStockProducts > 0 && (
                <span className="badge warning">{shopStats.lowStockProducts}</span>
              )}
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
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
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
            <Route path="/" element={<ProductManagement />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/settings" element={<ShopSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;