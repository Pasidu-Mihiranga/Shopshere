// formatters.js
// Format currency with specified locale and currency code
export const formatCurrency = (value, locale = 'en-US', currency = 'USD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  };
  
  // Format date with specified locale and options
  export const formatDate = (date, options = {}, locale = 'en-US') => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const dateOptions = { ...defaultOptions, ...options };
    return new Date(date).toLocaleDateString(locale, dateOptions);
  };
  
  // Format a date to show relative time (e.g., "2 hours ago")
  export const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return 'just now';
    }
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Convert to days
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Convert to weeks
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    
    // Convert to months
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    // Convert to years
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };
  
  // Format a phone number to a standardized format
  export const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      // US format: (XXX) XXX-XXXX
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    } else if (cleaned.length > 10) {
      // International format
      return `+${cleaned.substring(0, cleaned.length - 10)} (${cleaned.substring(cleaned.length - 10, cleaned.length - 7)}) ${cleaned.substring(cleaned.length - 7, cleaned.length - 4)}-${cleaned.substring(cleaned.length - 4)}`;
    }
    
    // Return original if we can't format it
    return phoneNumber;
  };
  
  // Format a credit card number to include spaces for readability
  export const formatCreditCardNumber = (number) => {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // Add a space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };
  
  // Truncate text with ellipsis if it exceeds maximum length
  export const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  // Format file size in human readable format
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };
  