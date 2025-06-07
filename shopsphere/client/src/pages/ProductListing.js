// src/pages/ProductListing.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard';
import Pagination from '../components/Common/Pagination';
import './ProductListing.css';

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const productsPerPage = 12;

  // Function to fetch products by category (or all products with filters)
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?categories=${categoryId}`);
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // FIXED: Added port 5000
        const response = await axios.get(`http://localhost:5000/api/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Main function to fetch products with all filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      
      // Pagination
      params.set('page', currentPage.toString());
      params.set('limit', productsPerPage.toString());
      
      // Sorting
      params.set('sort', sortBy);
      
      // Search term
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      
      // Categories (this is the key part for category filtering)
      const categories = searchParams.get('category') || searchParams.get('categories');
      if (categories) {
        params.set('categories', categories);
        console.log('🔍 Filtering by category:', categories);
      }
      
      // Price range
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      
      // Rating
      const rating = searchParams.get('rating');
      if (rating) params.set('rating', rating);
      
      console.log('🔍 Final API call:', `http://localhost:5000/api/products?${params.toString()}`);
      console.log(`${params.toString()}`);
      // FIXED: Corrected the API URL - removed typo and used correct endpoint
      const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
      
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setError('');
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when URL parameters change
  useEffect(() => {
    fetchProducts();
  }, [location.search, currentPage, sortBy]);

  // Update current page when URL changes
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(pageFromUrl);
  }, [searchParams]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Update URL with new page number
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', pageNumber.toString());
    navigate(`${location.pathname}?${newParams.toString()}`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    // Update URL with new sort parameter
    const newParams = new URLSearchParams(location.search);
    newParams.set('sort', newSortBy);
    if (currentPage !== 1) {
      newParams.set('page', '1');
      setCurrentPage(1);
    }
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  // Toggle view mode (grid/list)
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Helper function to get category name from id
  const getCategoryName = (categories, categoryId) => {
    if (!categories || !Array.isArray(categories) || !categoryId) {
      return 'All';
    }
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'All';
  };

  const searchTerm = searchParams.get('search');
  const categoryId = searchParams.get('category') || searchParams.get('categories');

  return (
    <div className="product-listing-page">
      <div className="product-listing-container">
        <div className="product-content">
          {/* Page header */}
          <div className="product-header">
            {searchTerm ? (
              <h1 className="search-results-title">
                Search Results for "{searchTerm}"
              </h1>
            ) : categoryId ? (
              <h1 className="category-results-title">
                {getCategoryName(categories, categoryId)} Products
              </h1>
            ) : (
              <h1>All Products</h1>
            )}
            
            {/* Product controls */}
            <div className="product-sorting">
              <div className="results-count">
                {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
              </div>
              
              <div className="sort-control">
                <label>Sort by:</label>
                <select value={sortBy} onChange={handleSortChange}>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
              
              {/* View mode toggle */}
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
            <div className="no-products-found">
              <div className="no-products-icon">🔍</div>
              <h3>No Products Found</h3>
              <p>No products found matching your criteria.</p>
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
              <div className={`products-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {products.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {Math.ceil(totalProducts / productsPerPage) > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalProducts / productsPerPage)}
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

export default ProductListing;