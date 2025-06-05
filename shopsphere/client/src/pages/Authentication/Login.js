// =============================================================================
// SOLUTION FOR 404 ERROR - Backend API Configuration
// =============================================================================

// =============================================================================
// 1. CHECK YOUR BACKEND SERVER STATUS
// =============================================================================

/*
First, verify your backend is running:

1. Open terminal and navigate to your server folder
2. Run: npm start (or node server.js)
3. You should see: "Server is running on port 5000" or similar
4. Test: http://localhost:5000/api (should return API info)
*/

// =============================================================================
// 2. UPDATED LOGIN COMPONENT WITH API BASE URL FIX
// =============================================================================

// src/pages/Authentication/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { authUtils } from '../../utils/auth';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // API Configuration - Fix for 404 error
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Get redirect path from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '';
  
  // Debug logs
  console.log('🔍 Login Component:', {
    currentLocation: location.pathname,
    redirectParam: redirectTo,
    contextUser: user,
    authLoading,
    utilsAuth: authUtils.isAuthenticated(),
    apiBase: API_BASE
  });

  // Check if user is already authenticated using auth utils
  useEffect(() => {
    console.log('🔍 Checking existing authentication...');
    
    // Check auth utils first
    const auth = authUtils.getAuth();
    if (auth) {
      console.log('✅ User already authenticated via auth utils:', auth.user.email);
      authUtils.setupAxiosInterceptor();
      setCheckingAuth(false);
      handleRedirectAfterLogin(auth.user);
      return;
    }
    
    // Fallback to context user
    if (user && !authLoading) {
      console.log('✅ User already authenticated via context:', user.email);
      setCheckingAuth(false);
      handleRedirectAfterLogin(user);
      return;
    }
    
    console.log('❌ No existing authentication found');
    setCheckingAuth(false);
  }, [user, authLoading]);

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log('🔬 Testing API connection...');
      const response = await axios.get(`${API_BASE}/api`);
      console.log('✅ API Connection successful:', response.data);
      return true;
    } catch (error) {
      console.error('❌ API Connection failed:', error);
      setError(`Cannot connect to server at ${API_BASE}. Please check if the backend server is running.`);
      return false;
    }
  };
  
  const handleRedirectAfterLogin = (loggedInUser) => {
    let destination = '/';
    
    if (redirectTo) {
      destination = decodeURIComponent(redirectTo);
      console.log('🎯 Redirecting to requested path:', destination);
    } else {
      if (loggedInUser.userType === 'customer') {
        destination = '/dashboard';
      } else if (loggedInUser.userType === 'shop_owner') {
        destination = '/seller-dashboard';
      } else {
        destination = '/';
      }
      console.log('🎯 Redirecting to default path for user type:', destination);
    }
    
    setTimeout(() => {
      navigate(destination, { replace: true });
    }, 100);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log('🔑 Starting login process...', { 
      email: formData.email, 
      userType: formData.userType,
      apiBase: API_BASE 
    });
    
    try {
      // Test API connection first
      const apiConnected = await testAPIConnection();
      if (!apiConnected) {
        return; // Error already set in testAPIConnection
      }

      // Make login API call with full URL
      console.log('📡 Making API call to:', `${API_BASE}/api/auth/login`);
      
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      });
      
      console.log('✅ Login API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Save authentication data using auth utils
      console.log('💾 Saving authentication data with auth utils...');
      const saved = authUtils.saveAuth(token, userData);
      
      if (!saved) {
        throw new Error('Failed to save authentication data');
      }

      console.log('🎉 Auth data saved successfully!');

      // Try to update auth context if available
      if (login && typeof login === 'function') {
        try {
          console.log('🔄 Updating auth context...');
          await login(formData);
        } catch (contextError) {
          console.warn('⚠️ Auth context update failed, but login was successful:', contextError);
        }
      }
      
      console.log('✅ Login successful! User:', userData.email, 'Type:', userData.userType);
      
      setTimeout(() => {
        handleRedirectAfterLogin(userData);
      }, 200);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      // Clear any partial auth data
      authUtils.clearAuth();
      
      // Handle different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError(`Cannot connect to server. Please check if the backend server is running on ${API_BASE}`);
      } else if (error.response?.status === 404) {
        setError(`Login endpoint not found. Please check if the backend server is properly configured at ${API_BASE}/api/auth/login`);
      } else if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.status === 403) {
        setError('Account access denied. Please contact support.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Test login function for quick testing
  const handleTestLogin = async (testType) => {
    const testCredentials = {
      customer: {
        email: 'customer@test.com',
        password: 'password123',
        userType: 'customer'
      },
      shop_owner: {
        email: 'shop@test.com',
        password: 'password123',
        userType: 'shop_owner'
      }
    };

    const credentials = testCredentials[testType];
    if (!credentials) return;

    setFormData(credentials);
    setError('');
    
    setTimeout(() => {
      document.querySelector('.login-form').requestSubmit();
    }, 100);
  };

  // Quick registration function
  const handleQuickRegister = async (userType) => {
    try {
      const testUser = {
        firstName: userType === 'shop_owner' ? 'Test' : 'Customer',
        lastName: userType === 'shop_owner' ? 'Owner' : 'User',
        email: userType === 'shop_owner' ? 'shop@test.com' : 'customer@test.com',
        password: 'password123',
        userType: userType
      };

      console.log('Creating test user:', testUser);
      
      const response = await axios.post(`${API_BASE}/api/auth/register`, testUser);
      console.log('Test user created:', response.data);
      
      setFormData({
        email: testUser.email,
        password: testUser.password,
        userType: testUser.userType
      });
      
      setError('');
      console.log('Test user created! You can now login.');
      
    } catch (error) {
      console.error('Test user creation failed:', error);
      if (error.response?.data?.message?.includes('already exists')) {
        setFormData({
          email: userType === 'shop_owner' ? 'shop@test.com' : 'customer@test.com',
          password: 'password123',
          userType: userType
        });
        setError('');
      } else if (error.response?.status === 404) {
        setError(`Registration endpoint not found. Please check if the backend server is running at ${API_BASE}`);
      } else {
        setError('Failed to create test user: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Test backend connection
  const handleTestBackend = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔬 Testing backend connection...');
      
      // Test root endpoint
      const rootResponse = await axios.get(`${API_BASE}/`);
      console.log('✅ Root endpoint working:', rootResponse.data);
      
      // Test API endpoint
      const apiResponse = await axios.get(`${API_BASE}/api`);
      console.log('✅ API endpoint working:', apiResponse.data);
      
      // Test health endpoint
      const healthResponse = await axios.get(`${API_BASE}/api/health`);
      console.log('✅ Health endpoint working:', healthResponse.data);
      
      setError(''); // Clear any previous errors
      alert(`✅ Backend connection successful!\n\nServer: ${API_BASE}\nStatus: ${healthResponse.data.status}\nDatabase: ${healthResponse.data.database}`);
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError(`❌ Cannot connect to backend server at ${API_BASE}\n\n🔧 Solutions:\n1. Start your backend server (npm start)\n2. Check if server is running on port 5000\n3. Verify the server URL is correct`);
      } else if (error.response?.status === 404) {
        setError(`❌ API endpoints not found on ${API_BASE}\n\n🔧 Solutions:\n1. Check if your backend routes are properly configured\n2. Verify the API endpoints exist\n3. Check server console for errors`);
      } else {
        setError(`❌ Backend error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading if checking authentication
  if (checkingAuth || authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
        <style>{`
          .auth-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 20px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #F15A24;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your SHOPSPHERE account</p>
        </div>
        
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <span className="error-text">{error}</span>
              {error.includes('Cannot connect') && (
                <button 
                  onClick={handleTestBackend}
                  disabled={loading}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Test Backend Connection
                </button>
              )}
            </div>
            <button 
              className="error-close"
              onClick={() => setError('')}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your email"
              className={error && error.includes('email') ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your password"
              className={error && error.includes('password') ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userType">Account Type</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="customer">Customer</option>
              <option value="shop_owner">Shop Owner</option>
            </select>
          </div>
          
          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot your password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner small"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        
      </div>
      
      <style jsx>{`
        
      `}</style>
    </div>
  );
};

export default Login;

// =============================================================================
// 3. BACKEND SERVER TROUBLESHOOTING STEPS
// =============================================================================

/*
STEP 1: Check if backend server is running
----------------------------------------------
Open terminal in your server folder and run:
npm start
or
node server.js

You should see output like:
✅ MongoDB connected successfully to: localhost:27017
📊 Database: shopsphere
🚀 Starting SHOPSPHERE API...
✅ All routes configured successfully
Server listening on port 5000

STEP 2: Test backend endpoints manually
----------------------------------------------
Open browser and test these URLs:
1. http://localhost:5000/ (should show welcome message)
2. http://localhost:5000/api (should show API info)
3. http://localhost:5000/api/health (should show health status)

STEP 3: Check backend routes configuration
----------------------------------------------
Make sure your server.js includes:
- app.post('/api/auth/login', ...)
- app.post('/api/auth/register', ...)
- Proper route mounting

STEP 4: Check CORS configuration
----------------------------------------------
Make sure your backend allows requests from http://localhost:3000

STEP 5: Check MongoDB connection
----------------------------------------------
Ensure MongoDB is running and connected properly

STEP 6: Environment variables
----------------------------------------------
Check if you have the right PORT and MONGODB_URI in your .env file
*/