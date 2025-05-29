import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    quantity: '',
    isActive: true,
    isPromoted: false
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('/api/products/shop'),
          axios.get('/api/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setError('');
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        response = await axios.put(`/api/products/${currentProduct._id}`, productData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const updatedProducts = products.map(product =>
          product._id === currentProduct._id ? response.data : product
        );
        setProducts(updatedProducts);
      } else {
        response = await axios.post('/api/products', productData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setProducts([...products, response.data]);
      }
      resetForm();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
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
      quantity: product.inventory.quantity,
      isActive: product.isActive,
      isPromoted: product.isPromoted
    });
    setImages([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  const toggleProductStatus = async (id, isActive) => {
    try {
      const response = await axios.patch(`/api/products/${id}/status`, { isActive: !isActive });
      const updatedProducts = products.map(product =>
        product._id === id ? { ...product, isActive: response.data.isActive } : product
      );
      setProducts(updatedProducts);
    } catch (error) {
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
      isActive: true,
      isPromoted: false
    });
    setImages([]);
    setCurrentProduct(null);
    setShowForm(false);
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="product-management-container">
      <div className="product-management-header">
        <h2>Product Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {showForm && (
        <div className="product-form-container">
          <h3>{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sub-Category</label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Product Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>You can select multiple images. Maximum 5 images per product.</small>
            </div>
            
            <div className="form-row checkbox-row">
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <label htmlFor="isActive">Active</label>
              </div>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  name="isPromoted"
                  id="isPromoted"
                  checked={formData.isPromoted}
                  onChange={handleChange}
                />
                <label htmlFor="isPromoted">Featured/Promoted</label>
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {currentProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="products-list">
        {products.length === 0 ? (
          <p>You don't have any products yet.</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.images[0] || '/images/placeholder.png'}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.categoryName}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.inventory.quantity}</td>
                  <td>
                    <div className="status-toggle">
                      <input
                        type="checkbox"
                        id={`status-${product._id}`}
                        checked={product.isActive}
                        onChange={() => toggleProductStatus(product._id, product.isActive)}
                      />
                      <label htmlFor={`status-${product._id}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </label>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;