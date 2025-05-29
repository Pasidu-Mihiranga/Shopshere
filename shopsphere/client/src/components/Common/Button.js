// Button.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Button.scss';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`
        btn
        btn-${variant}
        btn-${size}
        ${fullWidth ? 'btn-full-width' : ''}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;