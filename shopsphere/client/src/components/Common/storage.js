
export const setItem = (key, value, expirationMinutes = null) => {
    const item = {
      value: value,
      timestamp: new Date().getTime()
    };
    
    if (expirationMinutes) {
      item.expiration = expirationMinutes * 60 * 1000; 
    }
    
    localStorage.setItem(key, JSON.stringify(item));
  };
  
  export const getItem = (key) => {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
      return null;
    }
    
    try {
      const item = JSON.parse(itemStr);
      const now = new Date().getTime();
      
      if (item.expiration && now - item.timestamp > item.expiration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (e) {
      return itemStr;
    }
  };
  
  export const removeItem = (key) => {
    localStorage.removeItem(key);
  };
  
  export const clear = () => {
    localStorage.clear();
  };
  
  export const getAllKeys = () => {
    return Object.keys(localStorage);
  };
  
  export const hasKey = (key) => {
    return localStorage.getItem(key) !== null;
  };
  
  export const getStorageUsage = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      total += (key.length + value.length) * 2; 
    }
    return total;
  };
  
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
  