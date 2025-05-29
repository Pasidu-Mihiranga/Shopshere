// FormInput.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/FormInput.scss';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="form-input"
        {...props}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string
};

export default FormInput;
