import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'discount',
    value: '',
    code: '',
    minimumPurchase: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
    applicableProducts: [],
    applicableCategories: [],
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promotionsRes, productsRes, categoriesRes] = await Promise.all([
          axios.get('/api/promotions'),
          axios.get('/api/products/shop'),
          axios.get('/api/categories')
        ]);
        setPromotions(promotionsRes.data);
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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'applicableProducts' || name === 'applicableCategories') {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({ ...formData, [name]: options });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (currentPromotion) {
        response = await axios.put(`/api/promotions/${currentPromotion._id}`, formData);
        const updatedPromotions = promotions.map(promotion =>
          promotion._id === currentPromotion._id ? response.data : promotion
        );
        setPromotions(updatedPromotions);
      } else {
        response = await axios.post('/api/promotions', formData);
        setPromotions([...promotions, response.data]);
      }
      resetForm();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save promotion');
    }
  };

  const handleEdit = (promotion) => {
    setCurrentPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      code: promotion.code || '',
      minimumPurchase: promotion.minimumPurchase || '',
      startDate: format(new Date(promotion.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(promotion.endDate), 'yyyy-MM-dd'),
      applicableProducts: promotion.applicableProducts || [],
      applicableCategories: promotion.applicableCategories || [],
      isActive: promotion.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`/api/promotions/${id}`);
        setPromotions(promotions.filter(promotion => promotion._id !== id));
      } catch (error) {
        setError('Failed to delete promotion');
      }
    }
  };

  const togglePromotionStatus = async (id, isActive) => {
    try {
      const response = await axios.patch(`/api/promotions/${id}/status`, { isActive: !isActive });
      const updatedPromotions = promotions.map(promotion =>
        promotion._id === id ? { ...promotion, isActive: response.data.isActive } : promotion
      );
      setPromotions(updatedPromotions);
    } catch (error) {
      setError('Failed to update promotion status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'discount',
      value: '',
      code: '',
      minimumPurchase: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
      applicableProducts: [],
      applicableCategories: [],
      isActive: true
    });
    setCurrentPromotion(null);
    setShowForm(false);
  };

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className="promotion-management-container">
      <div className="promotion-management-header">
        <h2>Promotion Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Create Promotion'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {showForm && (
        <div className="promotion-form-container">
          <h3>{currentPromotion ? 'Edit Promotion' : 'Create New Promotion'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Promotion Name</label>
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
                <label>Promotion Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="discount">Fixed Discount</option>
                  <option value="percentage">Percentage Discount</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="coupon">Coupon Code</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value {formData.type === 'percentage' ? '(%)' : '($)'}</label>
                <input
                  type="number"
                  name="value"
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  value={formData.value}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {formData.type === 'coupon' && (
              <div className="form-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required={formData.type === 'coupon'}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Minimum Purchase (optional)</label>
              <input
                type="number"
                name="minimumPurchase"
                min="0"
                step="0.01"
                value={formData.minimumPurchase}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Applicable Products (optional)</label>
              <select
                name="applicableProducts"
                multiple
                value={formData.applicableProducts}
                onChange={handleChange}
              >
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <small>Hold Ctrl/Cmd key to select multiple products. Leave empty for all products.</small>
            </div>
            
            <div className="form-group">
              <label>Applicable Categories (optional)</label>
              <select
                name="applicableCategories"
                multiple
                value={formData.applicableCategories}
                onChange={handleChange}
              >
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <small>Hold Ctrl/Cmd key to select multiple categories. Leave empty for all categories.</small>
            </div>
            
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
            
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {currentPromotion ? 'Update Promotion' : 'Create Promotion'}
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
      
      <div className="promotions-list">
        {promotions.length === 0 ? (
          <p>You don't have any promotions yet.</p>
        ) : (
          <table className="promotions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Date Range</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion._id}>
                  <td>{promotion.name}</td>
                  <td>
                    {promotion.type === 'discount' && 'Fixed Discount'}
                    {promotion.type === 'percentage' && 'Percentage'}
                    {promotion.type === 'flash_sale' && 'Flash Sale'}
                    {promotion.type === 'coupon' && `Coupon (${promotion.code})`}
                  </td>
                  <td>
                    {promotion.type === 'percentage'
                      ? `${promotion.value}%`
                      : `$${promotion.value.toFixed(2)}`
                    }
                  </td>
                  <td>
                    {format(new Date(promotion.startDate), 'MMM dd, yyyy')} -
                    {format(new Date(promotion.endDate), 'MMM dd, yyyy')}
                  </td>
                  <td>
                    <div className="status-toggle">
                      <input
                        type="checkbox"
                        id={`status-${promotion._id}`}
                        checked={promotion.isActive}
                        onChange={() => togglePromotionStatus(promotion._id, promotion.isActive)}
                      />
                      <label htmlFor={`status-${promotion._id}`}>
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </label>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(promotion)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(promotion._id)}
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

export default PromotionManagement;