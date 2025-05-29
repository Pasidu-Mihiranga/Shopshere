// validation.js
// Simple validation helper functions

// Email validation
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Password validation (at least 8 chars, 1 number, 1 uppercase)
  export const isValidPassword = (password) => {
    if (password.length < 8) return false;
    if (!/\d/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    return true;
  };
  
  // Get password strength (0-4)
  export const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };
  
  // Phone number validation
  export const isValidPhoneNumber = (phone) => {
    const regex = /^\+?[0-9]{10,15}$/;
    return regex.test(phone.replace(/\s+/g, ''));
  };
  
  // Credit card validation (basic Luhn algorithm)
  export const isValidCreditCard = (number) => {
    if (!/^\d+$/.test(number.replace(/\s+/g, ''))) return false;
    
    const digits = number.replace(/\s+/g, '').split('').map(Number);
    
    // Check if the card length is valid
    if (digits.length < 13 || digits.length > 19) return false;
    
    // Luhn algorithm
    let sum = 0;
    const parity = digits.length % 2;
    
    for (let i = 0; i < digits.length; i++) {
      let digit = digits[i];
      if (i % 2 === parity) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
    }
    
    return sum % 10 === 0;
  };
  
  // Check if credit card is expired
  export const isCreditCardExpired = (month, year) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed
    const currentYear = now.getFullYear() % 100; // Get last 2 digits
    
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);
    
    if (expiryYear < currentYear) return true;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return true;
    
    return false;
  };
  
  // Form validation helper
  export const validateForm = (values, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const value = values[field];
      const fieldRules = rules[field];
      
      if (fieldRules.required && (!value || value.trim() === '')) {
        errors[field] = fieldRules.message || 'This field is required';
      } else if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `Must be at least ${fieldRules.minLength} characters`;
      } else if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `Must be no more than ${fieldRules.maxLength} characters`;
      } else if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || 'Invalid format';
      } else if (value && fieldRules.isEmail && !isValidEmail(value)) {
        errors[field] = 'Invalid email address';
      } else if (value && fieldRules.isPassword && !isValidPassword(value)) {
        errors[field] = 'Password must be at least 8 characters with 1 number and 1 uppercase letter';
      } else if (value && fieldRules.isPhone && !isValidPhoneNumber(value)) {
        errors[field] = 'Invalid phone number';
      } else if (fieldRules.match && values[fieldRules.match] !== value) {
        errors[field] = 'Fields do not match';
      } else if (fieldRules.validate && typeof fieldRules.validate === 'function') {
        const result = fieldRules.validate(value, values);
        if (result) {
          errors[field] = result;
        }
      }
    });
    
    return errors;
  };
  