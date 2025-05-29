// src/components/Filter/FilterSidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const FilterSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({
    min: queryParams.get('minPrice') || '',
    max: queryParams.get('maxPrice') || ''
  });
  const [selectedCategories, setSelectedCategories] = useState(
    queryParams.get('categories') ? queryParams.get('categories').split(',') : []
  );
  const [rating, setRating] = useState(queryParams.get('rating') || '');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    // Update state when URL params change
    setSelectedCategories(
      queryParams.get('categories') ? queryParams.get('categories').split(',') : []
    );
    setPriceRange({
      min: queryParams.get('minPrice') || '',
      max: queryParams.get('maxPrice') || ''
    });
    setRating(queryParams.get('rating') || '');
  }, [location.search, queryParams]);
  
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  const handleRatingChange = (value) => {
    setRating(value === rating ? '' : value);
  };
  
  const applyFilters = () => {
    const newParams = new URLSearchParams(location.search);
    
    // Update category filter
    if (selectedCategories.length > 0) {
      newParams.set('categories', selectedCategories.join(','));
    } else {
      newParams.delete('categories');
    }
    
    // Update price filter
    if (priceRange.min) {
      newParams.set('minPrice', priceRange.min);
    } else {
      newParams.delete('minPrice');
    }
    
    if (priceRange.max) {
      newParams.set('maxPrice', priceRange.max);
    } else {
      newParams.delete('maxPrice');
    }
    
    // Update rating filter
    if (rating) {
      newParams.set('rating', rating);
    } else {
      newParams.delete('rating');
    }
    
    // Navigate with new filters
    navigate(`${location.pathname}?${newParams.toString()}`);
  };
  
  const clearFilters = () => {
    const newParams = new URLSearchParams();
    
    // Preserve search query if it exists
    const searchQuery = queryParams.get('search');
    if (searchQuery) {
      newParams.set('search', searchQuery);
    }
    
    // Reset states
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setRating('');
    
    // Navigate with cleared filters
    navigate(`${location.pathname}?${newParams.toString()}`);
  };
  
  if (loading) return <div>Loading filters...</div>;
  
  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="btn-clear-filters" onClick={clearFilters}>
          Clear All
        </button>
      </div>
      
      <div className="filter-section">
        <h4>Categories</h4>
        <div className="category-filters">
          {categories.map(category => (
            <div key={category._id} className="filter-checkbox">
              <input
                type="checkbox"
                id={`category-${category._id}`}
                checked={selectedCategories.includes(category._id)}
                onChange={() => handleCategoryChange(category._id)}
              />
              <label htmlFor={`category-${category._id}`}>{category.name}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-range-inputs">
          <div className="form-group">
            <input
              type="number"
              name="min"
              placeholder="Min"
              value={priceRange.min}
              onChange={handlePriceChange}
              min="0"
            />
          </div>
          <span className="price-range-separator">-</span>
          <div className="form-group">
            <input
              type="number"
              name="max"
              placeholder="Max"
              value={priceRange.max}
              onChange={handlePriceChange}
              min="0"
            />
          </div>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Customer Rating</h4>
        <div className="rating-filters">
          {[5, 4, 3, 2, 1].map(value => (
            <div key={value} className="filter-radio">
              <input
                type="radio"
                id={`rating-${value}`}
                name="rating"
                checked={rating === value.toString()}
                onChange={() => handleRatingChange(value.toString())}
              />
              <label htmlFor={`rating-${value}`}>
                {[...Array(value)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
                {[...Array(5 - value)].map((_, i) => (
                  <span key={i} className="star-empty">☆</span>
                ))}
                <span className="rating-text">& Up</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <button className="btn-apply-filters" onClick={applyFilters}>
        Apply Filters
      </button>
    </div>
  );
};

export default FilterSidebar;