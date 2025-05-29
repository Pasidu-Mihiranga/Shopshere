// api.js
import axios from 'axios';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API service functions
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  socialLogin: (data) => api.post('/auth/social-login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me')
};

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (address) => api.post('/users/addresses', address),
  updateAddress: (id, address) => api.put(`/users/addresses/${id}`, address),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`)
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductsByCategory: (categoryId, params) => 
    api.get(`/products/category/${categoryId}`, { params }),
  searchProducts: (query, params) => 
    api.get('/products/search', { params: { ...params, query } })
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (item) => api.post('/cart/items', item),
  updateItem: (productId, data) => api.put(`/cart/items/${productId}`, data),
  removeItem: (productId, attributes) => 
    api.delete(`/cart/items/${productId}`, { data: { attributes } }),
  clearCart: () => api.delete('/cart'),
  applyDiscount: (code) => api.post('/cart/discount', { code })
};

export const orderService = {
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`)
};

export const shopService = {
  getShopProducts: () => api.get('/products/shop'),
  createProduct: (product) => api.post('/products', product),
  updateProduct: (id, product) => api.put(`/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateProductStatus: (id, isActive) => 
    api.patch(`/products/${id}/status`, { isActive }),
  getShopOrders: () => api.get('/orders/shop'),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getPromotions: () => api.get('/promotions'),
  createPromotion: (promotion) => api.post('/promotions', promotion),
  updatePromotion: (id, promotion) => api.put(`/promotions/${id}`, promotion),
  deletePromotion: (id) => api.delete(`/promotions/${id}`),
  updatePromotionStatus: (id, isActive) => 
    api.patch(`/promotions/${id}/status`, { isActive })
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`)
};

export const paymentService = {
  createPaymentIntent: (amount, currency) => 
    api.post('/payments/create-intent', { amount, currency }),
  confirmPayment: (data) => api.post('/payments/confirm-payment', data),
  createPaymentMethod: (cardDetails) => 
    api.post('/payments/create-payment-method', cardDetails)
};
