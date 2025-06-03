// src/utils/auth.js
import axios from 'axios';

export const AUTH_STORAGE_KEY = 'shopsphere_auth';

export const authUtils = {
  // Save authentication data
  saveAuth: (token, user) => {
    try {
      console.log('💾 Saving auth data:', { userEmail: user.email, userType: user.userType });
      
      const authData = {
        token,
        user,
        timestamp: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      // Save to multiple storage keys for redundancy
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      // Set axios default header immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Auth data saved successfully');
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
        
        // Check if token is expired
        if (authData.expiresAt && Date.now() > authData.expiresAt) {
          console.log('❌ Token expired, clearing auth data');
          authUtils.clearAuth();
          return null;
        }
      }
      
      console.log('✅ Auth data retrieved:', { userEmail: user.email, userType: user.userType });
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

  // Refresh token if needed (placeholder for future implementation)
  refreshToken: async () => {
    try {
      const auth = authUtils.getAuth();
      if (!auth) return false;

      // In the future, you can implement token refresh logic here
      console.log('🔄 Token refresh not implemented yet');
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  },

  // Debug function to log all auth state
  debugAuth: () => {
    const auth = authUtils.getAuth();
    console.log('🔍 Auth Debug Info:', {
      isAuthenticated: authUtils.isAuthenticated(),
      hasToken: !!localStorage.getItem('token'),
      hasUser: !!localStorage.getItem('user'),
      currentUser: auth?.user,
      tokenLength: localStorage.getItem('token')?.length,
      axiosHeaderSet: !!axios.defaults.headers.common['Authorization']
    });
    return auth;
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

// Initialize axios header on module load
const initAuth = authUtils.getAuth();
if (initAuth) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initAuth.token}`;
  console.log('🔐 Axios header initialized on module load');
}

export default authUtils;