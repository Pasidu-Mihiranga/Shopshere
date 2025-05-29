import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = '',
  label = '',
  error = '',
  success = '',
  helperText = '',
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  readOnly = false,
  required = false,
  autoFocus = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const inputClasses = [
    'input-field',
    error ? 'input-error' : '',
    success ? 'input-success' : '',
    icon ? `input-with-icon input-icon-${iconPosition}` : '',
    disabled ? 'input-disabled' : '',
    isFocused ? 'input-focused' : '',
    className
  ].filter(Boolean).join(' ');
  
  const containerClasses = [
    'input-container',
    fullWidth ? 'input-full-width' : ''
  ].filter(Boolean).join(' ');
  
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  
  return (
    <div className={containerClasses}>
      {label && (
        <label 
          htmlFor={name} 
          className={`input-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">{icon}</span>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoFocus={autoFocus}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon-right">{icon}</span>
        )}
        
        {error && (
          <div className="input-feedback error">{error}</div>
        )}
        
        {!error && success && (
          <div className="input-feedback success">{success}</div>
        )}
        
        {!error && !success && helperText && (
          <div className="input-helper-text">{helperText}</div>
        )}
      </div>
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string
};

export default Input;