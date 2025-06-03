
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { authUtils } from '../../utils/auth';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

      // Fetch all data in parallel
      const [productsResponse, categoriesResponse, shopResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/products/shop`, config),
        axios.get(`${API_BASE}/api/categories`),
        axios.get(`${API_BASE}/api/shop/info`, config)
      ]);
      
      console.log('✅ Data fetched successfully');
      
      // Handle products data
      const productsData = productsResponse.data?.products || [];
      const categoriesData = categoriesResponse.data?.categories || [];
      const shopData = shopResponse.data?.shop || null;
      
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

  // Rest of your component methods remain the same...
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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
  };

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
      <div style={{
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px 16px',
        marginBottom: '20px',
        borderRadius: '5px',
        border: '1px solid #c3e6cb'
      }}>
        🎉 Authentication successful! Welcome to your product management dashboard.
      </div>

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
          {error}
        </div>
      )}

      {/* Simple success content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
        <h3>Product Management Ready!</h3>
        <p>
          Welcome <strong>{userInfo?.firstName} {userInfo?.lastName}</strong>!<br/>
          Your shop: <strong>{shopInfo?.shopName || 'Loading...'}</strong><br/>
          Current products: <strong>{products.length}</strong><br/>
          Available categories: <strong>{categories.length}</strong>
        </p>
        
        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={fetchData}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Refresh Data
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
              fontWeight: '600'
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'left'
          }}>
            <h4>🔍 Debug Information</h4>
            <p><strong>User Email:</strong> {userInfo?.email}</p>
            <p><strong>User Type:</strong> {userInfo?.userType}</p>
            <p><strong>Shop Name:</strong> {shopInfo?.shopName}</p>
            <p><strong>Token Present:</strong> {authUtils.getAuth()?.token ? 'Yes' : 'No'}</p>
            <p><strong>Products Count:</strong> {products.length}</p>
            <p><strong>Categories Count:</strong> {categories.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;