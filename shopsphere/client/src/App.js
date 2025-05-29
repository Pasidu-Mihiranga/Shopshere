// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Authentication/Login';
import Register from './pages/Authentication/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductListing />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="dashboard" element={
                
                <CustomerDashboard />
                
              } />
              <Route path="seller-dashboard" element={
               
                <ShopOwnerDashboard />
                
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;