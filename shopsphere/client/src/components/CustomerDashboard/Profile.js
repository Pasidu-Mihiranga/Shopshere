// src/components/CustomerDashboard/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/users/profile', formData);
      setUser({ ...user, ...response.data });
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Update failed');
    }
  };
  
  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!isEditing}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!isEditing}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={true} // Email shouldn't be editable
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        {isEditing ? (
          <div className="button-group">
            <button type="submit" className="btn-primary">Save Changes</button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </form>
    </div>
  );
};

export default Profile;