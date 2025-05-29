// src/components/CustomerDashboard/Addresses.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    addressType: 'shipping',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get('/api/users/addresses');
        setAddresses(response.data);
        setError('');
      } catch (error) {
        setError('Failed to fetch addresses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, []);
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      
      if (currentAddress) {
        response = await axios.put(`/api/users/addresses/${currentAddress._id}`, formData);
        const updatedAddresses = addresses.map(address => 
          address._id === currentAddress._id ? response.data : address
        );
        setAddresses(updatedAddresses);
      } else {
        response = await axios.post('/api/users/addresses', formData);
        setAddresses([...addresses, response.data]);
      }
      
      resetForm();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save address');
    }
  };
  
  const handleEdit = (address) => {
    setCurrentAddress(address);
    setFormData({
      addressType: address.addressType,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await axios.delete(`/api/users/addresses/${id}`);
        setAddresses(addresses.filter(address => address._id !== id));
      } catch (error) {
        setError('Failed to delete address');
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      addressType: 'shipping',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
    setCurrentAddress(null);
    setShowForm(false);
  };
  
  if (loading) return <div>Loading addresses...</div>;
  
  return (
    <div className="addresses-container">
      <div className="addresses-header">
        <h2>My Addresses</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {showForm && (
        <div className="address-form-container">
          <h3>{currentAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Address Type</label>
              <select 
                name="addressType" 
                value={formData.addressType} 
                onChange={handleChange}
              >
                <option value="shipping">Shipping</option>
                <option value="billing">Billing</option>
              </select>
            </div>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Zip/Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group checkbox">
              <input
                type="checkbox"
                name="isDefault"
                id="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <label htmlFor="isDefault">Set as default address</label>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {currentAddress ? 'Update Address' : 'Add Address'}
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
      
      <div className="addresses-list">
        {addresses.length === 0 ? (
          <p>You don't have any saved addresses yet.</p>
        ) : (
          addresses.map((address) => (
            <div key={address._id} className="address-card">
              <div className="address-type">
                {address.addressType.charAt(0).toUpperCase() + address.addressType.slice(1)} Address
                {address.isDefault && <span className="default-badge">Default</span>}
              </div>
              <div className="address-content">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
              </div>
              <div className="address-actions">
                <button 
                  className="btn-icon"
                  onClick={() => handleEdit(address)}
                >
                  Edit
                </button>
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(address._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Addresses;