// Loader.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Loader.scss';

const Loader = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  transparent = false,
  className = '' 
}) => {
  const loader = (
    <div className={`loader loader-${size} ${transparent ? 'loader-transparent' : ''} ${className}`}>
      <div className="loader-spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {loader}
      </div>
    );
  }

  return loader;
};
Loader.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    text: PropTypes.string,
    fullScreen: PropTypes.bool,
    transparent: PropTypes.bool,
    className: PropTypes.string
  };
  
  export default Loader;
  