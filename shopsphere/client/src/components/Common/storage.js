// storage.js
// Local storage wrapper with expiration support

// Set item with optional expiration
export const setItem = (key, value, expirationMinutes = null) => {
    const item = {
      value: value,
      timestamp: new Date().getTime()
    };
    
    if (expirationMinutes) {
      item.expiration = expirationMinutes * 60 * 1000; // Convert to milliseconds
    }
    
    localStorage.setItem(key, JSON.stringify(item));
  };
  
  // Get item and check expiration
  export const getItem = (key) => {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
      return null;
    }
    
    try {
      const item = JSON.parse(itemStr);
      const now = new Date().getTime();
      
      // Check if the item is expired
      if (item.expiration && now - item.timestamp > item.expiration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (e) {
      // If parsing fails, return the raw value (backwards compatibility)
      return itemStr;
    }
  };
  
  // Remove item
  export const removeItem = (key) => {
    localStorage.removeItem(key);
  };
  
  // Clear all items
  export const clear = () => {
    localStorage.clear();
  };
  
  // Get all keys
  export const getAllKeys = () => {
    return Object.keys(localStorage);
  };
  
  // Check if key exists
  export const hasKey = (key) => {
    return localStorage.getItem(key) !== null;
  };
  
  // Get storage used in bytes
  export const getStorageUsage = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      total += (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
    }
    return total;
  };
  
  // Session storage variants
  export const session = {
    setItem: (key, value) => {
      sessionStorage.setItem(key, JSON.stringify({ value }));
    },
    
    getItem: (key) => {
      const itemStr = sessionStorage.getItem(key);
      if (!itemStr) return null;
      
      try {
        const { value } = JSON.parse(itemStr);
        return value;
      } catch (e) {
        return itemStr;
      }
    },
    
    removeItem: (key) => {
      sessionStorage.removeItem(key);
    },
    
    clear: () => {
      sessionStorage.clear();
    }
  };
  
  // Cookie utilities
  export const cookies = {
    set: (name, value, days = 7, path = '/') => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + 
                        '; expires=' + expires + 
                        '; path=' + path;
    },
    
    get: (name) => {
      const value = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        return value;
      }
    },
    
    remove: (name, path = '/') => {
      cookies.set(name, '', -1, path);
    }
  };
  