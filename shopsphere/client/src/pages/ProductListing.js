import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard';
import Pagination from '../components/Common/Pagination';
import './ProductListing.css';

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState(queryParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  
  const productsPerPage = 12;
  const port = process.env.PORT_ORIGIN;
  
  
  
  // Get all URL params for filters
  const searchQuery = queryParams.get('search') || '';
  const categoryParam = queryParams.get('categories') || '';
  const minPrice = queryParams.get('minPrice') || '';
  const maxPrice = queryParams.get('maxPrice') || '';
  const ratingFilter = queryParams.get('rating') || '';
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        // Create query string
        const params = new URLSearchParams();
        
        // Pagination
        params.set('page', currentPage.toString());
        params.set('limit', productsPerPage.toString());
        
        // Sorting
        params.set('sort', sortOption);
        
        // Search
        if (searchQuery) {
          params.set('search', searchQuery);
        }
        
        // Category filter
        if (categoryParam) {
          params.set('categories', categoryParam);
        }
        
        // Price range
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        
        // Rating filter
        if (ratingFilter) params.set('rating', ratingFilter);
        
        // Fetch products
        const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
        
        setProducts(response.data.products);
        setTotalProducts(response.data.total);
        setTotalPages(Math.ceil(response.data.total / productsPerPage));
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, sortOption, searchQuery, categoryParam, minPrice, maxPrice, ratingFilter]);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Update URL with new page number
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    navigate(`${location.pathname}?${params.toString()}`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    
    // Update URL with new sort parameter
    const params = new URLSearchParams(location.search);
    params.set('sort', newSortOption);
    
    // Reset to page 1 when sorting changes
    if (currentPage !== 1) {
      params.set('page', '1');
      setCurrentPage(1);
    }
    
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  // Toggle view mode (grid/list)
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };
  
  // Toggle mobile filter sidebar
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
    
    // Prevent body scrolling when filter is open
    if (!isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  return (
    <div className="product-listing-page">
      {/* Mobile filter button */}
      <button 
        className="mobile-filter-btn"
        onClick={toggleMobileFilter}
      >
        <span>Filters</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor"/>
        </svg>
      </button>
      
      <div className="product-listing-container">
        
        
        {/* Overlay for mobile filter */}
        {isMobileFilterOpen && (
          <div 
            className="filter-overlay"
            onClick={toggleMobileFilter}
          />
        )}
        
        {/* Product content */}
        <div className="product-content">
          {/* Page header */}
          <div className="product-listing-header">
            {searchQuery ? (
              <h1>Search Results for "{searchQuery}"</h1>
            ) : categoryParam ? (
              <h1>{getCategoryName(categories, categoryParam)} Products</h1>
            ) : (
              <h1>All Products</h1>
            )}
          </div>
          
          {/* Sorting and display options */}
          <div className="product-controls">
            <div className="product-count">
              <p>{totalProducts} Products</p>
            </div>
            
            <div className="product-sort">
              <label htmlFor="sort-select">Sort by:</label>
              <select 
                id="sort-select"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            
            <div className="view-options">
              <button 
                className={`view-option ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => toggleViewMode('grid')}
                aria-label="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z" fill="currentColor"/>
                </svg>
              </button>
              <button 
                className={`view-option ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => toggleViewMode('list')}
                aria-label="List view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <h3>No Products Found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button 
                className="clear-filters-btn"
                onClick={() => navigate('/products')}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`products-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {products.map(product => (
                  <ProductCard 
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get category name from id
const getCategoryName = (categories, categoryId) => {
  const category = categories.find(cat => cat._id === categoryId);
  return category ? category.name : 'All';
};

export default ProductListing;