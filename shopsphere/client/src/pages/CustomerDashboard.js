// src/pages/CustomerDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Profile from '../components/CustomerDashboard/Profile';
import Orders from '../components/CustomerDashboard/Orders';
import Addresses from '../components/CustomerDashboard/Addresses';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [userStats, setUserStats] = useState({
    orderCount: 0,
    wishlistCount: 0,
    addressCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Debug logs
  console.log('CustomerDashboard - User:', user);
  console.log('CustomerDashboard - Location:', location.pathname);
  
  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname.split('/');
    const currentTab = path[path.length - 1];
    
    console.log('Setting active tab to:', currentTab);
    
    if (currentTab === 'dashboard') {
      setActiveTab('profile');
    } else {
      setActiveTab(currentTab);
    }
  }, [location.pathname]);
  
  // Fetch user stats (optional - dashboard should work even if this fails)
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setStatsLoading(true);
        console.log('Fetching user stats...');
        
        // This endpoint might not exist yet, so we'll make it optional
        const response = await axios.get('/api/user/stats');
        setUserStats(response.data);
        console.log('User stats loaded:', response.data);
        setError('');
      } catch (err) {
        console.warn('Could not fetch user stats (this is optional):', err);
        // Don't show error for stats as it's not critical
        // Keep default stats (all zeros)
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);
  
  // Handle logout
  const handleLogout = () => {
    console.log('Logging out user...');
    logout();
    navigate('/');
  };
  
  // This check is now handled by ProtectedRoute, but keep as safety net
  if (!user) {
    console.log('No user in CustomerDashboard, this should not happen if ProtectedRoute is working');
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
  
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>My Account</h1>
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
          <div className="user-profile-card">
            <div className="user-avatar">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={`${user.firstName}'s avatar`}
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="avatar-placeholder"
                style={{
                  display: user.profileImage ? 'none' : 'flex',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#F15A24',
                  color: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              >
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div className="user-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p>{user.email}</p>
              <small>Customer Account</small>
            </div>
          </div>
          
          <nav className="dashboard-nav">
            <Link 
              to="/dashboard" 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-4.987-3.744A7.966 7.966 0 0 0 12 20c1.97 0 3.773-.712 5.167-1.892A6.979 6.979 0 0 0 12.16 16a6.981 6.981 0 0 0-5.147 2.256zM5.616 16.82A8.975 8.975 0 0 1 12.16 14a8.972 8.972 0 0 1 6.362 2.634 8 8 0 1 0-12.906.187zM12 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                </svg>
              </div>
              <span>Profile</span>
            </Link>
            
            <Link 
              to="/dashboard/orders" 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM8 7h8v2H8V7zm0 4h8v2H8v-2zm0 4h8v2H8v-2z" fill="currentColor"/>
                </svg>
              </div>
              <span>Orders</span>
              {!statsLoading && <span className="badge">{userStats.orderCount}</span>}
            </Link>
            
            <Link 
              to="/dashboard/addresses" 
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="currentColor"/>
                </svg>
              </div>
              <span>Addresses</span>
              {!statsLoading && <span className="badge">{userStats.addressCount}</span>}
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
            <Route path="/" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/addresses" element={<Addresses />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;