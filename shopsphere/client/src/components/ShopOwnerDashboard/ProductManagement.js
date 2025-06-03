// src/components/ShopOwnerDashboard/ProductManagement.js - PART 1
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProductManagement = () => {
  const { apiClient } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    quantity: '',
    sku: '',
    isActive: true,
    isPromoted: false
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching products and categories...');
        
        // Test backend connectivity first
        try {
          await apiClient.get('/api/health');
          console.log('Backend is reachable');
        } catch (healthError) {
          console.warn('Backend health check failed:', healthError.message);
          setError('Cannot connect to server. Please make sure your backend is running on http://localhost:5000');
          setLoading(false);
          return;
        }
        
        // Fetch products and categories
        const productsPromise = apiClient.get('/api/products/shop').catch(error => {
          console.warn('Products API error:', error.response?.status, error.message);
          if (error.response?.status === 404) {
            throw new Error('Products endpoint not found. Please check your backend routes.');
          }
          throw error;
        });
        
        const categoriesPromise = apiClient.get('/api/categories').catch(error => {
          console.warn('Categories API not available, using defaults:', error.message);
          return { data: [
            { _id: '1', name: 'Electronics' },
            { _id: '2', name: 'Clothing' },
            { _id: '3', name: 'Books' },
            { _id: '4', name: 'Home & Garden' },
            { _id: '5', name: 'Sports' }
          ]};
        });
        
        const [productsRes, categoriesRes] = await Promise.all([
          productsPromise,
          categoriesPromise
        ]);
        
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
        console.log('Data loaded successfully');
        setError('');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [apiClient]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // Clear any previous errors when user starts typing
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 images allowed per product');
      return;
    }
    
    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (not an image)`);
      } else if (file.size > 5 * 1024 * 1024) { // 5MB
        invalidFiles.push(`${file.name} (too large)`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.join(', ')}`);
      return;
    }
    
    setImages(validFiles);
    
    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));
    // Clean up old previews
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview(previews);
    setError('');
  };

  const removeImagePreview = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreview[index]);
    
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Product name is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.price || parseFloat(formData.price) <= 0) errors.push('Valid price is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.quantity || parseInt(formData.quantity) < 0) errors.push('Valid quantity is required');
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError('');
    
    // Create FormData for file upload
    const productData = new FormData();
    
    // Append form data
    Object.keys(formData).forEach(key => {
      productData.append(key, formData[key]);
    });
    
    // Append images
    images.forEach(image => {
      productData.append('images', image);
    });
    
    try {
      let response;
      if (currentProduct) {
        console.log('Updating product:', currentProduct._id);
        response = await apiClient.put(`/api/products/${currentProduct._id}`, productData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Update product in state
        const updatedProducts = products.map(product =>
          product._id === currentProduct._id ? response.data.product : product
        );
        setProducts(updatedProducts);
        
      } else {
        console.log('Creating new product');
        response = await apiClient.post('/api/products', productData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Add new product to state
        setProducts([response.data.product, ...products]);
      }
      
      console.log('Product saved successfully');
      resetForm();
      
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid product data');
      } else if (error.response?.status === 401) {
        setError('You are not authorized to perform this action');
      } else if (error.response?.status === 404) {
        setError('Product API endpoint not found. Check your backend configuration.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (!error.response) {
        setError('Cannot connect to server. Please check your internet connection and ensure the backend is running.');
      } else {
        setError(error.response?.data?.message || 'Failed to save product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory || '',
      quantity: product.inventory?.quantity || 0,
      sku: product.inventory?.sku || '',
      isActive: product.isActive,
      isPromoted: product.isPromoted || false
    });
    setImages([]);
    setImagePreview([]);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.delete(`/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
        console.log('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const toggleProductStatus = async (id, isActive) => {
    try {
      const response = await apiClient.patch(`/api/products/${id}/status`, { isActive: !isActive });
      const updatedProducts = products.map(product =>
        product._id === id ? { ...product, isActive: response.data.isActive } : product
      );
      setProducts(updatedProducts);
      console.log('Product status updated');
    } catch (error) {
      console.error('Error updating product status:', error);
      setError('Failed to update product status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subCategory: '',
      quantity: '',
      sku: '',
      isActive: true,
      isPromoted: false
    });
    setImages([]);
    // Clean up image previews
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    setCurrentProduct(null);
    setShowForm(false);
    setError('');
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // ⚠️ CONTINUE TO PART 2 FOR THE RETURN JSX 
  // src/components/ShopOwnerDashboard/ProductManagement.js - PART 2 (JSX Return)
// ⚠️ This is the continuation of Part 1 - add this after the getCategoryName function

  if (loading) return (
    <div className="loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '50px',
      backgroundColor: 'white',
      borderRadius: '12px',
      margin: '20px'
    }}>
      <div className="loading-spinner" style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #F15A24',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <p style={{ color: '#666', fontSize: '16px' }}>Loading products...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <div className="product-management-container" style={{ 
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div className="product-management-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px',
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            color: '#333', 
            fontSize: '28px',
            fontWeight: '700'
          }}>
            🛍️ Product Management
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            color: '#666',
            fontSize: '16px'
          }}>
            Manage your shop's product inventory
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: showForm ? '#dc3545' : '#F15A24',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {showForm ? (
            <>
              <span>❌</span>
              Cancel
            </>
          ) : (
            <>
              <span>➕</span>
              Add New Product
            </>
          )}
        </button>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="error-alert" style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px 20px',
          marginBottom: '25px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <span className="error-icon" style={{ 
            marginRight: '12px',
            fontSize: '20px'
          }}>
            ⚠️
          </span>
          <span style={{ flex: 1, fontWeight: '500' }}>{error}</span>
          <button 
            onClick={() => setError('')} 
            className="error-close"
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              marginLeft: '12px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Product Form */}
      {showForm && (
        <div className="product-form-container" style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            marginBottom: '25px', 
            color: '#333',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '15px'
          }}>
            {currentProduct ? '✏️ Edit Product' : '➕ Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Name and SKU Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px', 
              marginBottom: '20px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., PROD-001"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
            </div>
            
            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '14px'
              }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your product in detail..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
            
            {/* Price and Quantity Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '20px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
            </div>
            
            {/* Category and Sub-Category Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px', 
              marginBottom: '25px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Sub-Category
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  placeholder="Optional sub-category"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
            </div>
            
            {/* Image Upload */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '14px'
              }}>
                Product Images
              </label>
              <div style={{
                border: '2px dashed #F15A24',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                backgroundColor: '#fff8f6',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    marginBottom: '15px',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor: 'white'
                  }}
                />
                <div>
                  <p style={{ 
                    margin: '5px 0', 
                    color: '#F15A24',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    📷 Upload up to 5 images
                  </p>
                  <small style={{ 
                    color: '#666',
                    fontSize: '13px'
                  }}>
                    Supported formats: JPG, PNG, WEBP (Max 5MB each)
                  </small>
                </div>
              </div>
              
              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ 
                    marginBottom: '15px', 
                    color: '#333',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    📸 Image Preview:
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '15px'
                  }}>
                    {imagePreview.map((preview, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        border: '2px solid #e1e5e9',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(index)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(220, 53, 69, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Checkboxes */}
            <div style={{ 
              display: 'flex', 
              gap: '30px', 
              marginBottom: '30px', 
              flexWrap: 'wrap',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#F15A24'
                  }}
                />
                <span>📦 Active (visible to customers)</span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  name="isPromoted"
                  checked={formData.isPromoted}
                  onChange={handleChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#F15A24'
                  }}
                />
                <span>⭐ Featured/Promoted</span>
              </label>
            </div>
            
            {/* Submit Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              flexWrap: 'wrap',
              justifyContent: 'flex-start'
            }}>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? '#ccc' : '#F15A24',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? (
                  <>
                    <span>⏳</span>
                    {currentProduct ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <span>{currentProduct ? '💾' : '➕'}</span>
                    {currentProduct ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Products List */}
      <div className="products-list">
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ 
              marginBottom: '10px', 
              color: '#333',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              No Products Yet
            </h3>
            <p style={{ 
              marginBottom: '25px', 
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              Start building your inventory by adding your first product to your shop.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: '#F15A24',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>➕</span>
              Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Products Summary */}
            <div style={{
              padding: '25px',
              borderBottom: '2px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <h3 style={{ 
                  margin: '0 0 5px 0', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '20px'
                }}>
                  📊 Product Inventory
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {products.length} product{products.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '20px', 
                fontSize: '14px', 
                color: '#666',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 12px',
                  backgroundColor: '#d4edda',
                  borderRadius: '20px',
                  color: '#155724'
                }}>
                  <span>✅</span>
                  <span>{products.filter(p => p.isActive).length} active</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 12px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '20px',
                  color: '#721c24'
                }}>
                  <span>❌</span>
                  <span>{products.filter(p => !p.isActive).length} inactive</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 12px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '20px',
                  color: '#856404'
                }}>
                  <span>📦</span>
                  <span>{products.filter(p => p.inventory?.quantity === 0).length} out of stock</span>
                </div>
              </div>
            </div>
            
            {/* Products Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '18px 15px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Image
                    </th>
                    <th style={{ 
                      padding: '18px 15px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Product Details
                    </th>
                    <th style={{ 
                      padding: '18px 15px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Category
                    </th>
                    <th style={{ 
                      padding: '18px 15px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Price
                    </th>
                    <th style={{ 
                      padding: '18px 15px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Stock
                    </th>
                    <th style={{ 
                      padding: '18px 15px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      padding: '18px 15px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} style={{ 
                      opacity: !product.isActive ? 0.6 : 1,
                      borderBottom: '1px solid #dee2e6',
                      transition: 'background-color 0.2s ease'
                    }}>
                      <td style={{ padding: '18px 15px' }}>
                        <img
                          src={product.images?.[0] || '/images/placeholder.png'}
                          alt={product.name}
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '2px solid #dee2e6',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                          onError={(e) => {
                            e.target.src = '/images/placeholder.png';
                          }}
                        />
                      </td>
                      <td style={{ padding: '18px 15px' }}>
                        <div>
                          <h4 style={{ 
                            margin: '0 0 8px 0', 
                            fontSize: '16px', 
                            color: '#333',
                            fontWeight: '600',
                            lineHeight: '1.3'
                          }}>
                            {product.name}
                          </h4>
                          {product.inventory?.sku && (
                            <div style={{ 
                              fontSize: '12px',
                              color: '#666',
                              marginBottom: '5px'
                            }}>
                              SKU: {product.inventory.sku}
                            </div>
                          )}
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '8px'
                          }}>
                            {product.isPromoted && (
                              <span style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                backgroundColor: '#fff3cd',
                                color: '#856404',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                gap: '4px'
                              }}>
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 15px', color: '#666' }}>
                        {getCategoryName(product.category)}
                      </td>
                      <td style={{ padding: '18px 15px' }}>
                        <span style={{ 
                          fontWeight: '700', 
                          color: '#333', 
                          fontSize: '18px'
                        }}>
                          ${product.price?.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: '18px 15px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: product.inventory?.quantity === 0 ? '#f8d7da' : 
                                         product.inventory?.quantity < 10 ? '#fff3cd' : '#d4edda',
                          color: product.inventory?.quantity === 0 ? '#721c24' : 
                                 product.inventory?.quantity < 10 ? '#856404' : '#155724'
                        }}>
                          {product.inventory?.quantity || 0}
                          {product.inventory?.quantity === 0 ? ' (Out)' : 
                           product.inventory?.quantity > 0 && product.inventory?.quantity < 10 ? ' (Low)' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '18px 15px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={product.isActive}
                            onChange={() => toggleProductStatus(product._id, product.isActive)}
                            style={{
                              width: '16px',
                              height: '16px',
                              accentColor: '#F15A24'
                            }}
                          />
                          <span style={{ 
                            fontSize: '14px', 
                            color: product.isActive ? '#155724' : '#721c24',
                            fontWeight: '500'
                          }}>
                            {product.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </label>
                      </td>
                      <td style={{ padding: '18px 15px', textAlign: 'center' }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px',
                          justifyContent: 'center'
                        }}>
                          <button
                            onClick={() => handleEdit(product)}
                            title="Edit Product"
                            style={{
                              background: 'none',
                              border: '2px solid #007bff',
                              color: '#007bff',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            title="Delete Product"
                            style={{
                              background: 'none',
                              border: '2px solid #dc3545',
                              color: '#dc3545',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;