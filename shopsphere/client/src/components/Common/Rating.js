// Rating.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Rating.scss';

const Rating = ({
  value,
  max = 5,
  size = 'medium',
  editable = false,
  onChange,
  className = '',
}) => {
  const renderStars = () => {
    const stars = [];
    const roundedValue = Math.round(value * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= max; i++) {
      let starClass = 'star-empty';
      
      if (i <= roundedValue) {
        starClass = 'star-full';
      } else if (i - 0.5 === roundedValue) {
        starClass = 'star-half';
      }

      stars.push(
        <span
          key={i}
          className={`star ${starClass}`}
          onClick={editable ? () => onChange(i) : undefined}
          onMouseEnter={editable ? (e) => {
            const parent = e.currentTarget.parentNode;
            const children = parent.children;
            for (let j = 0; j < children.length; j++) {
              if (j < i) {
                children[j].classList.add('star-hover');
              } else {
                children[j].classList.remove('star-hover');
              }
            }
          } : undefined}
          onMouseLeave={editable ? (e) => {
            const parent = e.currentTarget.parentNode;
            const children = parent.children;
            for (let j = 0; j < children.length; j++) {
              children[j].classList.remove('star-hover');
            }
          } : undefined}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div className={`rating rating-${size} ${editable ? 'rating-editable' : ''} ${className}`}>
      {renderStars()}
    </div>
  );
};

Rating.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  editable: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string
};

export default Rating;
