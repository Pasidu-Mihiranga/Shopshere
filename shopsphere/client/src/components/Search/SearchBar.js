// src/components/Search/SearchBar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };
  
  return (
    <form className="search-form" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search for anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        <i className="search-icon">🔍</i>
      </button>
    </form>
  );
};

export default SearchBar;