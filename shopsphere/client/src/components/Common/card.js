// Card.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Card.scss';

const Card = ({ 
  children, 
  title, 
  className = '', 
  headerClassName = '',
  bodyClassName = '',
  footer,
  ...props 
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {title && (
        <div className={`card-header ${headerClassName}`}>
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footer: PropTypes.node
};

export default Card;
