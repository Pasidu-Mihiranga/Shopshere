// Dropdown.js
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Dropdown.scss';

const Dropdown = ({
  trigger,
  items,
  align = 'left',
  className = '',
  dropdownClassName = '',
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item) => {
    if (onSelect) onSelect(item);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={toggleDropdown}>
        {trigger}
      </div>
      {isOpen && (
        <ul className={`dropdown-menu dropdown-align-${align} ${dropdownClassName}`}>
          {items.map((item, index) => (
            <li 
              key={index} 
              className={`dropdown-item ${item.disabled ? 'disabled' : ''}`}
              onClick={() => !item.disabled && handleItemClick(item)}
            >
              {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
              <span className="dropdown-item-text">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
      icon: PropTypes.node,
      disabled: PropTypes.bool
    })
  ).isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  dropdownClassName: PropTypes.string,
  onSelect: PropTypes.func
};

export default Dropdown;
