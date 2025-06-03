// src/pages/Authentication/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'customer' // default to customer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '';
  
  // Debug logs
  console.log('Login Component - Current location:', location.pathname);
  console.log('Login Component - Redirect parameter:', redirectTo);
  console.log('Login Component - Current user:', user);
  console.log('Login Component - Auth loading:', authLoading);
  
  // If user is already logged in, redirect them
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User already logged in, redirecting...');
      handleRedirectAfterLogin(user);
    }
  }, [user, authLoading]);
  
  const handleRedirectAfterLogin = (loggedInUser) => {
    let destination = '/';
    
    if (redirectTo) {
      // If there's a specific redirect requested, use it
      destination = decodeURIComponent(redirectTo);
      console.log('Redirecting to requested path:', destination);
    } else {
      // Default redirects based on user type
      if (loggedInUser.userType === 'customer') {
        destination = '/dashboard';
      } else if (loggedInUser.userType === 'shop_owner') {
        destination = '/seller-dashboard';
      } else {
        destination = '/';
      }
      console.log('Redirecting to default path for user type:', destination);
    }
    
    navigate(destination, { replace: true });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
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
    
    console.log('Login attempt with:', { 
      email: formData.email, 
      userType: formData.userType 
    });
    
    try {
      const loggedInUser = await login(formData);
      console.log('Login successful:', loggedInUser);
      
      // Show success message briefly
      console.log('Login successful! Redirecting...');
      
      // Redirect after successful login
      handleRedirectAfterLogin(loggedInUser);
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
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

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider} - Not implemented yet`);
    setError(`${provider} login is not available yet. Please use email/password.`);
  };

  // Show loading if auth is being checked
  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
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
            <span className="error-text">{error}</span>
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
        
        <div className="divider">
          <span>Or continue with</span>
        </div>
        
        <div className="social-login">
          <button 
            type="button"
            className="btn-social btn-google"
            onClick={() => handleSocialLogin('Google')}
            disabled={loading}
          >
            <span className="social-icon">🔍</span>
            Google
          </button>
          
          <button 
            type="button"
            className="btn-social btn-facebook"
            onClick={() => handleSocialLogin('Facebook')}
            disabled={loading}
          >
            <span className="social-icon">📘</span>
            Facebook
          </button>
          
          <button 
            type="button"
            className="btn-social btn-apple"
            onClick={() => handleSocialLogin('Apple')}
            disabled={loading}
          >
            <span className="social-icon">🍎</span>
            Apple
          </button>
        </div>
        
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link 
              to={`/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
              className="register-link"
            >
              Create one now
            </Link>
          </p>
        </div>
        
        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <details>
              <summary>Debug Information</summary>
              <div className="debug-content">
                <p><strong>Redirect To:</strong> {redirectTo || 'None'}</p>
                <p><strong>Current User:</strong> {user ? `${user.email} (${user.userType})` : 'None'}</p>
                <p><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
                <p><strong>Login Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>Form Data:</strong> {JSON.stringify(formData, null, 2)}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;