// src/utils/auth.js
import axios from 'axios';

export const AUTH_STORAGE_KEY = 'shopsphere_auth';

export const authUtils = {
  // Save authentication data
  saveAuth: (token, user) => {
    try {
      console.log('💾 Saving auth data:', { userEmail: user.email, userType: user.userType });
      
      // Set expiration to 30 days (much longer than before)
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      
      const authData = {
        token,
        user,
        timestamp: Date.now(),
        expiresAt: Date.now() + THIRTY_DAYS,
        lastAccess: Date.now()
      };
      
      // Save to multiple storage keys for redundancy
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      // Set axios default header immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Auth data saved successfully with 30-day expiration');
      return true;
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
      return false;
    }
  },

  // Get authentication data
  getAuth: () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const authDataStr = localStorage.getItem(AUTH_STORAGE_KEY);
      
      if (!token || !userStr) {
        console.log('❌ No token or user data found');
        return null;
      }
      
      const user = JSON.parse(userStr);
      let authData = null;
      
      if (authDataStr) {
        authData = JSON.parse(authDataStr);
        
        // Check if token is expired (with some buffer time)
        const currentTime = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
        
        if (authData.expiresAt && currentTime > (authData.expiresAt - bufferTime)) {
          console.log('❌ Token expired or about to expire, clearing auth data');
          authUtils.clearAuth();
          return null;
        }
        
        // Update last access time
        authData.lastAccess = currentTime;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      }
      
      console.log('✅ Auth data retrieved:', { 
        userEmail: user.email, 
        userType: user.userType,
        daysUntilExpiry: authData ? Math.round((authData.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)) : 'unknown'
      });
      
      return { token, user, authData };
    } catch (error) {
      console.error('❌ Error getting auth data:', error);
      authUtils.clearAuth();
      return null;
    }
  },

  // Clear authentication data
  clearAuth: () => {
    try {
      console.log('🗑️ Clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem(AUTH_STORAGE_KEY);
      
      // Remove axios default header
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('✅ Auth data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const auth = authUtils.getAuth();
    const isAuth = auth !== null;
    console.log('🔍 Authentication check:', isAuth);
    return isAuth;
  },

  // Check if user has specific role
  hasRole: (requiredRole) => {
    const auth = authUtils.getAuth();
    if (!auth) {
      console.log('❌ No auth data for role check');
      return false;
    }
    
    const hasRequiredRole = auth.user.userType === requiredRole;
    console.log(`🔍 Role check: ${auth.user.userType} === ${requiredRole} = ${hasRequiredRole}`);
    return hasRequiredRole;
  },

  // Setup axios interceptor
  setupAxiosInterceptor: () => {
    const auth = authUtils.getAuth();
    if (auth) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
      console.log('🔐 Axios interceptor setup with token');
      return true;
    } else {
      console.log('❌ No auth data available for axios setup');
      return false;
    }
  },

  // Get current user info
  getCurrentUser: () => {
    const auth = authUtils.getAuth();
    return auth ? auth.user : null;
  },

  // Check if user is shop owner
  isShopOwner: () => {
    return authUtils.hasRole('shop_owner');
  },

  // Check if user is customer
  isCustomer: () => {
    return authUtils.hasRole('customer');
  },

  // Extend token expiration (useful for keeping active users logged in)
  extendToken: () => {
    try {
      const auth = authUtils.getAuth();
      if (!auth || !auth.authData) {
        console.log('❌ No auth data to extend');
        return false;
      }

      // Extend expiration by another 30 days
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      auth.authData.expiresAt = Date.now() + THIRTY_DAYS;
      auth.authData.lastAccess = Date.now();
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth.authData));
      
      console.log('✅ Token expiration extended by 30 days');
      return true;
    } catch (error) {
      console.error('❌ Error extending token:', error);
      return false;
    }
  },

  // Refresh token if needed
  refreshToken: async () => {
    try {
      const auth = authUtils.getAuth();
      if (!auth) {
        console.log('❌ No auth data for token refresh');
        return false;
      }

      // Check if token is close to expiry (within 7 days)
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const timeUntilExpiry = auth.authData?.expiresAt - Date.now();
      
      if (timeUntilExpiry < sevenDays) {
        console.log('🔄 Token close to expiry, attempting refresh...');
        
        try {
          // Try to refresh token with backend
          const response = await axios.post('/api/auth/refresh-token');
          
          if (response.data.token) {
            authUtils.saveAuth(response.data.token, auth.user);
            console.log('✅ Token refreshed successfully');
            return true;
          }
        } catch (refreshError) {
          console.log('❌ Token refresh failed, extending current token');
          // If refresh fails, extend current token
          return authUtils.extendToken();
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  },

  // Get time until token expiry
  getTimeUntilExpiry: () => {
    const auth = authUtils.getAuth();
    if (!auth || !auth.authData) return null;
    
    const timeLeft = auth.authData.expiresAt - Date.now();
    const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    return {
      milliseconds: timeLeft,
      days: daysLeft,
      hours: hoursLeft,
      isExpiringSoon: timeLeft < (7 * 24 * 60 * 60 * 1000) // Less than 7 days
    };
  },

  // Auto-extend token for active users
  autoExtendToken: () => {
    const auth = authUtils.getAuth();
    if (!auth || !auth.authData) return false;

    const lastAccess = auth.authData.lastAccess || auth.authData.timestamp;
    const timeSinceLastAccess = Date.now() - lastAccess;
    const oneDay = 24 * 60 * 60 * 1000;

    // If user was active in the last day and token expires in less than 7 days, extend it
    if (timeSinceLastAccess < oneDay) {
      const timeUntilExpiry = authUtils.getTimeUntilExpiry();
      if (timeUntilExpiry && timeUntilExpiry.isExpiringSoon) {
        console.log('🔄 Auto-extending token for active user');
        return authUtils.extendToken();
      }
    }

    return false;
  },

  // Debug function to log all auth state
  debugAuth: () => {
    const auth = authUtils.getAuth();
    const timeInfo = authUtils.getTimeUntilExpiry();
    
    console.log('🔍 Auth Debug Info:', {
      isAuthenticated: authUtils.isAuthenticated(),
      hasToken: !!localStorage.getItem('token'),
      hasUser: !!localStorage.getItem('user'),
      currentUser: auth?.user,
      tokenLength: localStorage.getItem('token')?.length,
      axiosHeaderSet: !!axios.defaults.headers.common['Authorization'],
      timeUntilExpiry: timeInfo,
      lastAccess: auth?.authData?.lastAccess ? new Date(auth.authData.lastAccess).toLocaleString() : 'unknown'
    });
    
    return auth;
  },

  // Initialize auth state (call this on app startup)
  initAuth: () => {
    try {
      console.log('🚀 Initializing auth state...');
      
      const auth = authUtils.getAuth();
      if (auth) {
        // Set up axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
        
        // Auto-extend if needed
        authUtils.autoExtendToken();
        
        console.log('✅ Auth state initialized successfully');
        return true;
      } else {
        console.log('ℹ️ No existing auth state found');
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing auth state:', error);
      authUtils.clearAuth();
      return false;
    }
  }
};

// Set up axios response interceptor to handle auth errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - clearing auth data');
      authUtils.clearAuth();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

// Set up periodic token extension for active users
let tokenExtensionInterval;

const startTokenExtensionCheck = () => {
  // Check every hour
  tokenExtensionInterval = setInterval(() => {
    if (authUtils.isAuthenticated()) {
      authUtils.autoExtendToken();
    } else {
      clearInterval(tokenExtensionInterval);
    }
  }, 60 * 60 * 1000); // 1 hour
};

// Initialize auth on module load
authUtils.initAuth();

// Start token extension checks
startTokenExtensionCheck();

export default authUtils;