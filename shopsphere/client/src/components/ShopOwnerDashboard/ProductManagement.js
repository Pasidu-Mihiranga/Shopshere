import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { authUtils } from '../../utils/auth';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [authChecking, setAuthChecking] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    sku: '',
    isActive: true,
    isPromoted: false
  });

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Check authentication on component mount
  useEffect(() => {
    console.log('🔍 ProductManagement: Checking authentication...');
    
    const auth = authUtils.getAuth();
    
    if (!auth) {
      console.log('❌ No authentication found');
      setError('Please login to access product management');
      setAuthChecking(false);
      setLoading(false);
      return;
    }
    
    if (auth.user.userType !== 'shop_owner') {
      console.log('❌ User is not a shop owner:', auth.user.userType);
      setError('Access denied. Shop owner role required.');
      setAuthChecking(false);
      setLoading(false);
      return;
    }
    
    console.log('✅ Authentication verified for shop owner:', auth.user.email);
    
    // Setup axios interceptor
    authUtils.setupAxiosInterceptor();
    
    setAuthChecking(false);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching shop data...');
      
      const auth = authUtils.getAuth();
      if (!auth) {
        throw new Error('Authentication lost');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      };

      // Updated API endpoints to match the new routes
      const [productsResponse, categoriesResponse, shopResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/products/shop/products`, config), // Updated endpoint
        axios.get(`${API_BASE}/api/categories`),
        axios.get(`${API_BASE}/api/shop/info`, config)
      ]);
      
      console.log('✅ Data fetched successfully');
      console.log('Products response:', productsResponse.data);
      console.log('Categories response:', categoriesResponse.data);
      console.log('Shop response:', shopResponse.data);
      
      // Handle the responses properly - check multiple possible data structures
      const productsData = productsResponse.data?.products || productsResponse.data || [];
      const categoriesData = categoriesResponse.data?.categories || categoriesResponse.data || [];
      const shopData = shopResponse.data?.shop || shopResponse.data || null;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setShopInfo(shopData);
      
      console.log('📦 Products loaded:', productsData.length);
      console.log('📚 Categories loaded:', categoriesData.length);
      console.log('🏪 Shop:', shopData?.shopName);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      
      if (error.response?.status === 401) {
        console.log('❌ Token expired, clearing auth');
        authUtils.clearAuth();
        setError('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }, 2000);
      } else {
        setError(`Failed to fetch data: ${error.response?.data?.message || error.message}`);
      }
      
      setProducts([]);
      setCategories([]);
      setShopInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setSelectedImages(files);
    
    // Create preview URLs
    const previews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    }).filter(Boolean);
    
    setImagePreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('📝 Form data before validation:', formData);
      
      // Enhanced validation with better error messages
      const errors = [];
      
      if (!formData.name || !formData.name.trim()) {
        errors.push('Product name is required');
      }
      
      if (!formData.description || !formData.description.trim()) {
        errors.push('Product description is required');
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        errors.push('Valid price greater than 0 is required');
      }
      
      if (!formData.category || !formData.category.trim()) {
        errors.push('Category is required');
      }
      
      if (formData.quantity === '' || formData.quantity === null || parseInt(formData.quantity) < 0) {
        errors.push('Valid quantity (0 or greater) is required');
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const auth = authUtils.getAuth();
      if (!auth) {
        throw new Error('Authentication lost');
      }

      // Create FormData for file upload
      const productData = new FormData();
      
      // Append form fields with proper type conversion
      productData.append('name', formData.name.trim());
      productData.append('description', formData.description.trim());
      productData.append('price', parseFloat(formData.price).toString());
      productData.append('category', formData.category);
      productData.append('quantity', parseInt(formData.quantity).toString());
      productData.append('sku', formData.sku.trim() || `SKU-${Date.now()}`);
      productData.append('isActive', formData.isActive.toString());
      productData.append('isPromoted', formData.isPromoted.toString());

      // Append images if any
      selectedImages.forEach((image, index) => {
        productData.append('images', image);
        console.log(`📷 Appending image ${index + 1}:`, image.name);
      });

      console.log('📤 Sending product data...');

      const config = {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (currentProduct) {
        // Update existing product - Updated endpoint
        console.log('🔄 Updating product:', currentProduct._id);
        response = await axios.put(`${API_BASE}/api/products/${currentProduct._id}`, productData, config);
        setSuccessMessage('Product updated successfully!');
        
        // Update products list
        setProducts(products.map(product => 
          product._id === currentProduct._id ? (response.data.product || response.data) : product
        ));
      } else {
        // Create new product - Updated endpoint
        console.log('➕ Creating new product...');
        response = await axios.post(`${API_BASE}/api/products`, productData, config);
        setSuccessMessage('Product created successfully!');
        
        // Add to products list
        const newProduct = response.data.product || response.data;
        setProducts([newProduct, ...products]);
      }

      console.log('✅ Product saved successfully:', response.data);
      
      // Reset form
      resetForm();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error saving product:', error);
      
      if (error.response?.status === 401) {
        authUtils.clearAuth();
        setError('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }, 20000);
      } else {
        // Extract the most relevant error message
        let errorMessage = 'Failed to save product';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    console.log('✏️ Editing product:', product);
    setCurrentProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || (product.category?._id) || '',
      quantity: product.inventory?.quantity || '',
      sku: product.inventory?.sku || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      isPromoted: product.isPromoted !== undefined ? product.isPromoted : false
    });
    setSelectedImages([]);
    setImagePreview([]);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const auth = authUtils.getAuth();
      if (!auth) {
        throw new Error('Authentication lost');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      };

      // Updated endpoint for delete
      await axios.delete(`${API_BASE}/api/products/${productId}`, config);
      
      setProducts(products.filter(product => product._id !== productId));
      setSuccessMessage('Product deleted successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error deleting product:', error);
      setError(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      quantity: '',
      sku: '',
      isActive: true,
      isPromoted: false
    });
    setCurrentProduct(null);
    setSelectedImages([]);
    setImagePreview([]);
    setShowForm(false);
    
    // Clear image preview URLs to prevent memory leaks
    imagePreview.forEach(url => URL.revokeObjectURL(url));
  };

  // Cleanup image preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreview]);

  // Show authentication checking
  if (authChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #F15A24',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verifying authentication...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show login required screen
  if (!authUtils.isAuthenticated() || !authUtils.hasRole('shop_owner')) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#2c3e50',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ margin: 0, fontSize: '32px' }}>Authentication Required</h2>
        <p style={{ fontSize: '18px', margin: '10px 0 30px 0', maxWidth: '400px' }}>
          {error || 'Please login to access product management.'}
        </p>
        <button
          onClick={() => {
            authUtils.clearAuth();
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }}
          style={{
            backgroundColor: '#e67e22',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          Go to Login
        </button>
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'left'
          }}>
            <h4>🔍 Debug Info</h4>
            <p><strong>Authenticated:</strong> {authUtils.isAuthenticated() ? 'Yes' : 'No'}</p>
            <p><strong>Has Shop Owner Role:</strong> {authUtils.hasRole('shop_owner') ? 'Yes' : 'No'}</p>
            <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <p><strong>User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #F15A24',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading your shop data...</p>
      </div>
    );
  }

  const auth = authUtils.getAuth();
  const userInfo = auth?.user;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header with Shop Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>Product Management</h2>
          <div style={{ margin: '5px 0 0 0', color: '#666' }}>
            <p style={{ margin: 0 }}>
              <strong>Shop:</strong> {shopInfo?.shopName || 'Your Shop'} | 
              <strong> Owner:</strong> {userInfo?.firstName} {userInfo?.lastName} | 
              <strong> Products:</strong> {products.length}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={isSubmitting}
          style={{
            backgroundColor: showForm ? '#dc3545' : '#F15A24',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>
            {currentProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Product Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter product description"
              />
            </div>

            {/* Price and Quantity Row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0.00"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category and SKU Row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <small style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                    No categories found. Please create categories first.
                  </small>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Product Images (Max 5)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              {imagePreview.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '10px',
                  flexWrap: 'wrap'
                }}>
                  {imagePreview.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        border: '1px solid #ddd'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Active Product</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="isPromoted"
                  checked={formData.isPromoted}
                  onChange={handleChange}
                />
                <span>Featured/Promoted</span>
              </label>
            </div>

            {/* Form Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#F15A24',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? 'Saving...' : (currentProduct ? 'Update Product' : 'Add Product')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <h3 style={{ marginTop: 0, color: '#333', marginBottom: '20px' }}>
          Your Products ({products.length})
        </h3>
        
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <p>No products yet. Add your first product to get started!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Product
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Price
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Quantity
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0].startsWith('http') ? product.images[0] : `${API_BASE}${product.images[0]}`}
                            alt={product.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '5px'
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '600' }}>{product.name}</div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            SKU: {product.inventory?.sku || 'N/A'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            Category: {product.categoryName || product.category?.name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      ${product.price?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {product.inventory?.quantity || 0}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: product.isActive ? '#d4edda' : '#f8d7da',
                        color: product.isActive ? '#155724' : '#721c24'
                      }}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.isPromoted && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          marginLeft: '5px'
                        }}>
                          Featured
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        marginTop: '20px',
        textAlign: 'center'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            🔄 Refresh Data
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#F15A24',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            ➕ Add Product
          </button>
          
          <button
            onClick={() => {
              authUtils.clearAuth();
              window.location.href = '/login';
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #F15A24',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <p style={{ margin: 0, fontWeight: '600' }}>
              {currentProduct ? 'Updating product...' : 'Creating product...'}
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
              Please wait while we process your request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;