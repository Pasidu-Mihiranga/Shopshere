// theme.js
// Theme configuration for the application

// Color palette
export const colors = {
    // Primary colors
    primary: '#F15A24',
    primaryLight: '#FF9D5C',
    primaryDark: '#D13800',
    
    // Secondary colors
    secondary: '#333333',
    secondaryLight: '#666666',
    secondaryDark: '#111111',
    
    // Neutral colors
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#E0E0E0',
    darkGray: '#888888',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    // Text colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#9E9E9E',
    
    // Border colors
    borderLight: '#E0E0E0',
    borderMedium: '#BDBDBD',
    
    // Background colors
    bgMain: '#FFFFFF',
    bgLight: '#F9F9F9',
    bgDark: '#333333'
  };
  
  // Typography
  export const typography = {
    // Font families
    fontPrimary: "'Open Sans', sans-serif",
    fontHeading: "'Montserrat', sans-serif",
    
    // Font sizes
    fontSizeXs: '0.75rem', // 12px
    fontSizeSm: '0.875rem', // 14px
    fontSizeMd: '1rem', // 16px
    fontSizeLg: '1.125rem', // 18px
    fontSizeXl: '1.25rem', // 20px
    fontSize2xl: '1.5rem', // 24px
    fontSize3xl: '1.875rem', // 30px
    fontSize4xl: '2.25rem', // 36px
    
    // Font weights
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
    
    // Line heights
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75
  };
  
  // Spacing
  export const spacing = {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    xxl: '3rem' // 48px
  };
  
  // Border radius
  export const borderRadius = {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.25rem', // 4px
    lg: '0.5rem', // 8px
    xl: '1rem', // 16px
    full: '9999px'
  };
  
  // Shadows
  export const shadows = {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
  };
  
  // Transitions
  export const transitions = {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease'
  };
  
  // Z-index values
  export const zIndex = {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500
  };
  
  // Breakpoints
  export const breakpoints = {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  };
  
  // Full theme object
  const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    transitions,
    zIndex,
    breakpoints
  };
  
  export default theme;
  
  // constants.js
  // Application constants
  
  // Application routes
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDER_CONFIRMATION: '/order-confirmation/:id',
    CUSTOMER_DASHBOARD: '/dashboard',
    CUSTOMER_PROFILE: '/dashboard/profile',
    CUSTOMER_ORDERS: '/dashboard/orders',
    CUSTOMER_WISHLIST: '/dashboard/wishlist',
    CUSTOMER_ADDRESSES: '/dashboard/addresses',
    SHOP_DASHBOARD: '/seller-dashboard',
    SHOP_PRODUCTS: '/seller-dashboard/products',
    SHOP_ORDERS: '/seller-dashboard/orders',
    SHOP_PROMOTIONS: '/seller-dashboard/promotions',
    SHOP_ANALYTICS: '/seller-dashboard/analytics'
  };
  
  // User roles
  export const USER_ROLES = {
    CUSTOMER: 'customer',
    SHOP_OWNER: 'shop_owner',
    ADMIN: 'admin'
  };
  
  // Order statuses
  export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    PAYMENT_FAILED: 'payment_failed'
  };
  
  // Payment methods
  export const PAYMENT_METHODS = {
    CARD: 'card',
    PAYPAL: 'paypal'
  };
  
  // Payment statuses
  export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
  };
  
  // Promotion types
  export const PROMOTION_TYPES = {
    DISCOUNT: 'discount',
    PERCENTAGE: 'percentage',
    FLASH_SALE: 'flash_sale',
    COUPON: 'coupon'
  };
  
  // Address types
  export const ADDRESS_TYPES = {
    SHIPPING: 'shipping',
    BILLING: 'billing'
  };
  
  // Sort options for product listings
  export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];
  
  // Product status
  export const PRODUCT_STATUS = {
    ACTIVE: true,
    INACTIVE: false
  };
  
  // Image placeholder
  export const PLACEHOLDER_IMAGE = '/images/placeholder.png';
  
  // Maximum upload sizes
  export const MAX_UPLOAD_SIZES = {
    PRODUCT_IMAGE: 5 * 1024 * 1024, // 5MB
    PROFILE_PICTURE: 2 * 1024 * 1024 // 2MB
  };
  
  // Local storage keys
  export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    CART: 'cart',
    THEME: 'theme',
    RECENTLY_VIEWED: 'recently_viewed'
  };
  
  // API error codes
  export const ERROR_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500
  };
  
  // Social auth providers
  export const AUTH_PROVIDERS = {
    LOCAL: 'local',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    APPLE: 'apple'
  };
  
  // Pagination
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12
  };
  
  // Form validation messages
  export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
    PASSWORD_MATCH: 'Passwords do not match',
    PHONE: 'Please enter a valid phone number'
  };
  
  // utils.js
  // General utility functions
  
  // Generate a random string (useful for IDs)
  export const generateRandomId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  // Deep clone an object
  export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => deepClone(item));
    }
    
    const clone = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = deepClone(obj[key]);
      }
    }
    
    return clone;
  };
  
  // Debounce function to limit how often a function can be called
  export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  // Throttle function to limit how often a function can be called
  export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };
  
  // Check if a value is empty (null, undefined, empty string, empty array, empty object)
  export const isEmpty = (value) => {
    if (value === null || value === undefined) {
      return true;
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    
    return false;
  };
  
  // Filter object properties
  export const filterObject = (obj, predicate) => {
    return Object.keys(obj)
      .filter(key => predicate(obj[key], key))
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  };
  
  // Remove null/undefined values from an object
  export const removeEmptyValues = (obj) => {
    return filterObject(obj, value => value !== null && value !== undefined);
  };
  
  // Convert an array to object with specified key
  export const arrayToObject = (array, key) => {
    return array.reduce((obj, item) => {
      obj[item[key]] = item;
      return obj;
    }, {});
  };
  
  // Group array items by a key
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  };
  
  // Sort array of objects by key
  export const sortByKey = (array, key, direction = 'asc') => {
    const multiplier = direction === 'desc' ? -1 : 1;
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return -1 * multiplier;
      if (a[key] > b[key]) return 1 * multiplier;
      return 0;
    });
  };
  
  // Safely access nested object properties without throwing errors
  export const getNestedValue = (obj, path, defaultValue = null) => {
    const keys = Array.isArray(path) ? path : path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length; i++) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[keys[i]];
    }
    
    return current === undefined ? defaultValue : current;
  };
  
  // Scroll to element by ID
  export const scrollToElement = (elementId, options = {}) => {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      offset: 0
    };
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    const { offset, ...scrollOptions } = mergedOptions;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      ...scrollOptions
    });
  };
  
  // Copy text to clipboard
  export const copyToClipboard = async (text) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  };
  
  // Check if a value is a valid URL
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  // Get file extension from a file name or path
  export const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  };
  
  // Check if an image file is valid (type and size)
  export const isValidImage = (file, maxSize = 5 * 1024 * 1024) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please upload a JPG, PNG, GIF, or WebP image.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` };
    }
    
    return { valid: true };
  };