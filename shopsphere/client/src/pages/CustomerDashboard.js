import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Profile from '../components/CustomerDashboard/Profile';
import Orders from '../components/CustomerDashboard/Orders';
import Addresses from '../components/CustomerDashboard/Addresses';
import Wishlist from '../components/CustomerDashboard/Wishlist';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname.split('/');
    const currentTab = path[path.length - 1];
    
    if (currentTab === 'dashboard') {
      setActiveTab('profile');
    } else {
      setActiveTab(currentTab);
    }
  }, [location.pathname]);
  
  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get('/api/user/stats');
        setUserStats(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Redirect if not logged in
  if (!user) {
    navigate('/login?redirect=dashboard');
    return null;
  }
  
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>My Account</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={`${user.firstName}'s avatar`} />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p>{user.email}</p>
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
              <span className="badge">{userStats.orderCount}</span>
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
              <span className="badge">{userStats.addressCount}</span>
            </Link>
            
            <Link 
              to="/dashboard/wishlist" 
              className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" fill="currentColor"/>
                </svg>
              </div>
              <span>Wishlist</span>
              <span className="badge">{userStats.wishlistCount}</span>
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
            <Route path="/" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;