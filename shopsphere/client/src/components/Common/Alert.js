// Alert.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Alert.scss';

const Alert = ({
  type = 'info',
  message,
  autoClose = false,
  duration = 5000,
  onClose,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, visible, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className={`alert alert-${type} ${className}`}>
      <div className="alert-content">
        {type === 'success' && <span className="alert-icon">✓</span>}
        {type === 'error' && <span className="alert-icon">✕</span>}
        {type === 'warning' && <span className="alert-icon">⚠</span>}
        {type === 'info' && <span className="alert-icon">ℹ</span>}
        <p className="alert-message">{message}</p>
      </div>
      <button className="alert-close" onClick={handleClose} aria-label="Close">
        ×
      </button>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  autoClose: PropTypes.bool,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  className: PropTypes.string
};

export default Alert;
