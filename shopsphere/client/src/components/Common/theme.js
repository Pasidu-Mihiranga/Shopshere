
export const colors = {
    primary: '#F15A24',
    primaryLight: '#FF9D5C',
    primaryDark: '#D13800',
    
    secondary: '#333333',
    secondaryLight: '#666666',
    secondaryDark: '#111111',
    
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#E0E0E0',
    darkGray: '#888888',
    
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#9E9E9E',   
    borderLight: '#E0E0E0',
    borderMedium: '#BDBDBD',
    
    bgMain: '#FFFFFF',
    bgLight: '#F9F9F9',
    bgDark: '#333333'
  };
  
  export const typography = {
    fontPrimary: "'Open Sans', sans-serif",
    fontHeading: "'Montserrat', sans-serif",
    
    fontSizeXs: '0.75rem', 
    fontSizeSm: '0.875rem', 
    fontSizeMd: '1rem', 
    fontSizeLg: '1.125rem', 
    fontSizeXl: '1.25rem', 
    fontSize2xl: '1.5rem', 
    fontSize3xl: '1.875rem', 
    fontSize4xl: '2.25rem', 
    
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
    
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75
  };
  
  export const spacing = {
    xs: '0.25rem', 
    sm: '0.5rem', 
    md: '1rem', 
    lg: '1.5rem', 
    xl: '2rem', 
    xxl: '3rem' 
  };
  
  export const borderRadius = {
    none: '0',
    sm: '0.125rem', 
    md: '0.25rem', 
    lg: '0.5rem', 
    xl: '1rem', 
    full: '9999px'
  };
  
  export const shadows = {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
  };
  
  export const transitions = {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease'
  };
  
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
  
  export const breakpoints = {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  };
  
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
  
  export const USER_ROLES = {
    CUSTOMER: 'customer',
    SHOP_OWNER: 'shop_owner',
    ADMIN: 'admin'
  };
  
  export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    PAYMENT_FAILED: 'payment_failed'
  };
  
  export const PAYMENT_METHODS = {
    CARD: 'card',
    PAYPAL: 'paypal'
  };
  
  export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
  };
  
  export const PROMOTION_TYPES = {
    DISCOUNT: 'discount',
    PERCENTAGE: 'percentage',
    FLASH_SALE: 'flash_sale',
    COUPON: 'coupon'
  };
  
  export const ADDRESS_TYPES = {
    SHIPPING: 'shipping',
    BILLING: 'billing'
  };
  
  export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];
  
  export const PRODUCT_STATUS = {
    ACTIVE: true,
    INACTIVE: false
  };
  
  export const PLACEHOLDER_IMAGE = '/images/placeholder.png';
  
  export const MAX_UPLOAD_SIZES = {
    PRODUCT_IMAGE: 5 * 1024 * 1024, 
    PROFILE_PICTURE: 2 * 1024 * 1024 
  }
  
  export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    CART: 'cart',
    THEME: 'theme',
    RECENTLY_VIEWED: 'recently_viewed'
  };
  
  export const ERROR_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500
  };
  
  export const AUTH_PROVIDERS = {
    LOCAL: 'local',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    APPLE: 'apple'
  };
  
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12
  };
  
  export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
    PASSWORD_MATCH: 'Passwords do not match',
    PHONE: 'Please enter a valid phone number'
  };
  export const generateRandomId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
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
  
  export const filterObject = (obj, predicate) => {
    return Object.keys(obj)
      .filter(key => predicate(obj[key], key))
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  };
  
  export const removeEmptyValues = (obj) => {
    return filterObject(obj, value => value !== null && value !== undefined);
  };
  
  export const arrayToObject = (array, key) => {
    return array.reduce((obj, item) => {
      obj[item[key]] = item;
      return obj;
    }, {});
  };
  
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
  
  export const sortByKey = (array, key, direction = 'asc') => {
    const multiplier = direction === 'desc' ? -1 : 1;
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return -1 * multiplier;
      if (a[key] > b[key]) return 1 * multiplier;
      return 0;
    });
  };
  
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
  
  export const copyToClipboard = async (text) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
    
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
  
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  export const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  };
  
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