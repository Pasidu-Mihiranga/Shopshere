// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug function
  const logDebug = (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AuthContext] ${message}`, data || '');
    }
  };

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor to add auth token
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        logDebug('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          hasAuth: !!config.headers.Authorization
        });
        return config;
      },
      (error) => {
        logDebug('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        logDebug('API Response success:', {
          status: response.status,
          url: response.config.url,
          hasData: !!response.data
        });
        return response;
      },
      (error) => {
        logDebug('API Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message,
          fullError: error.response?.data
        });

        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
          logDebug('401 Unauthorized - clearing auth state');
          localStorage.removeItem('token');
          setUser(null);
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logDebug('Initializing auth check...');
        logDebug('API Base URL:', API_BASE_URL);
        
        const token = localStorage.getItem('token');
        logDebug('Token from localStorage:', token ? 'Found' : 'Not found');
        
        if (!token) {
          logDebug('No token found, user not authenticated');
          setIsLoading(false);
          return;
        }

        // Verify token with backend
        logDebug('Verifying token with backend...');
        
        try {
          const response = await apiClient.get('/api/auth/me');
          
          logDebug('User authenticated successfully:', {
            id: response.data._id,
            email: response.data.email,
            userType: response.data.userType,
            firstName: response.data.firstName
          });
          
          setUser(response.data);
        } catch (verifyError) {
          logDebug('Token verification failed:', {
            status: verifyError.response?.status,
            message: verifyError.response?.data?.message || verifyError.message
          });
          
          // Clear invalid token
          localStorage.removeItem('token');
          setUser(null);
        }
        
      } catch (error) {
        logDebug('Auth initialization error:', error.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        logDebug('Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      logDebug('Login attempt started:', { 
        email: credentials.email, 
        userType: credentials.userType,
        apiUrl: `${API_BASE_URL}/api/auth/login`
      });
      
      setIsLoading(true);
      
      // Test if backend is reachable first
      try {
        await apiClient.get('/api/health');
        logDebug('Backend health check passed');
      } catch (healthError) {
        logDebug('Backend health check failed:', {
          status: healthError.response?.status,
          message: healthError.message
        });
        
        // If it's a 404, the backend might not have a health endpoint, continue anyway
        if (healthError.response?.status !== 404) {
          throw new Error(`Backend server is not reachable at ${API_BASE_URL}. Please make sure the server is running.`);
        }
      }
      
      const response = await apiClient.post('/api/auth/login', credentials);
      
      logDebug('Login response received:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        userType: response.data.user?.userType
      });
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server - missing token or user data');
      }
      
      // Store token
      localStorage.setItem('token', token);
      
      // Update user state
      setUser(user);
      
      logDebug('Login successful, user set:', {
        id: user._id,
        email: user.email,
        userType: user.userType
      });
      
      return user;
      
    } catch (error) {
      logDebug('Login failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        isNetworkError: !error.response
      });
      
      // Clean up on login failure
      localStorage.removeItem('token');
      setUser(null);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (!error.response) {
        // Network error
        errorMessage = `Cannot connect to server at ${API_BASE_URL}. Please check if the backend server is running.`;
      } else if (error.response.status === 404) {
        errorMessage = `Login endpoint not found. Please check if the backend server is properly configured.`;
      } else if (error.response.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.status = error.response?.status;
      
      throw enhancedError;
      
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      logDebug('Registration attempt started:', { 
        email: userData.email, 
        userType: userData.userType,
        apiUrl: `${API_BASE_URL}/api/auth/register`
      });
      
      setIsLoading(true);
      
      const response = await apiClient.post('/api/auth/register', userData);
      
      logDebug('Registration response received:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        userType: response.data.user?.userType
      });
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server - missing token or user data');
      }
      
      // Store token
      localStorage.setItem('token', token);
      
      // Update user state
      setUser(user);
      
      logDebug('Registration successful, user set:', {
        id: user._id,
        email: user.email,
        userType: user.userType
      });
      
      return user;
      
    } catch (error) {
      logDebug('Registration failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        isNetworkError: !error.response
      });
      
      // Clean up on registration failure
      localStorage.removeItem('token');
      setUser(null);
      
      // Provide user-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (!error.response) {
        errorMessage = `Cannot connect to server at ${API_BASE_URL}. Please check if the backend server is running.`;
      } else if (error.response.status === 404) {
        errorMessage = `Registration endpoint not found. Please check if the backend server is properly configured.`;
      } else if (error.response.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.status = error.response?.status;
      
      throw enhancedError;
      
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logDebug('Logout initiated');
    
    // Clear token from storage
    localStorage.removeItem('token');
    
    // Clear user state
    setUser(null);
    
    logDebug('Logout complete');
  };

  const updateUser = (updatedUserData) => {
    logDebug('User data updated:', updatedUserData);
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  // Check backend connectivity
  const checkBackendConnectivity = async () => {
    try {
      await apiClient.get('/api/health');
      return true;
    } catch (error) {
      logDebug('Backend connectivity check failed:', error.message);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkBackendConnectivity,
    // Helper methods
    isAuthenticated: !!user,
    isCustomer: user?.userType === 'customer',
    isShopOwner: user?.userType === 'shop_owner',
    isAdmin: user?.userType === 'admin',
    // API client for other components to use
    apiClient
  };

  // Debug current auth state
  useEffect(() => {
    logDebug('Auth state changed:', {
      isLoading,
      isAuthenticated: !!user,
      userType: user?.userType,
      userId: user?._id,
      apiBaseUrl: API_BASE_URL
    });
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};