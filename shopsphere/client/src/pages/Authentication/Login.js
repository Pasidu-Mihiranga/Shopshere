// src/pages/Authentication/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'customer' // default to customer
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      navigate(formData.userType === 'customer' ? '/dashboard' : '/seller-dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Account Type</label>
          <select name="userType" value={formData.userType} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="shop_owner">Shop Owner</option>
          </select>
        </div>
        <div className="form-group">
          <a href="/forgot-password">Forgot Password?</a>
        </div>
        <button type="submit" className="btn-primary" onClick={handleSubmit}>Login</button>
      </form>
      <div className="social-login">
        <p>Or login with:</p>
        <button className="btn-google">Google</button>
        <button className="btn-facebook">Facebook</button>
        <button className="btn-apple">Apple</button>
      </div>
      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
};

export default Login;