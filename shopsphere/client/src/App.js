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
import ProductsInfo from './components/ShopOwnerDashboard/ProductManagement';
import OrderInfo from './components/ShopOwnerDashboard/OrderManagement';
import ShopSettingsInfo from './components/ShopOwnerDashboard/ShopSettings';
import CusOrderInfo from './components/CustomerDashboard/Orders';
import ContactUs from "./components/ContactUs/contactUs";
import AboutUs from "./components/AboutUs/AboutUs";
import Cancellation from "./components/FooterCommon /Cancellation";
import Return from "./components/FooterCommon /Returns";
import PrivacyPolicy from "./components/FooterCommon /Privacy";   
import Payment from './components/FooterCommon /Payments';
import Security from './components/FooterCommon /Security';
import Shipping from './components/FooterCommon /Shipping';
import FAQ from './components/FooterCommon /FAQ';

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
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
                
                
              } />
              <Route path="dashboard/orders" element={
                <ProtectedRoute>
                  <CusOrderInfo />
                </ProtectedRoute>
                
                
              } />
              
              
              
              <Route path="seller-dashboard" element={
               <ProtectedRoute>
                <ShopOwnerDashboard />
               </ProtectedRoute>
                
                
              } />
              
              <Route path="seller-dashboard/products" element={
               <ProtectedRoute>
                <ProductsInfo />
               </ProtectedRoute>
                
                
              } />
              <Route path="seller-dashboard/orders" element={
               <ProtectedRoute>
                <OrderInfo />
               </ProtectedRoute>
                
                
              } />
              
              <Route path="seller-dashboard/settings" element={
               <ProtectedRoute>
                <ShopSettingsInfo />
               </ProtectedRoute>
                
                
              } />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/cancellation" element={<Cancellation />} />
              <Route path="/return" element={<Return />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/security" element={<Security />} />
              <Route path="/shipping" element={<Shipping />} /> 
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;