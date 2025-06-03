// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Debug logs to help troubleshoot
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - IsLoading:', isLoading);
  console.log('ProtectedRoute - Required Role:', requiredRole);
  console.log('ProtectedRoute - Current Location:', location.pathname);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        <div>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #F15A24',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If no user, redirect to login with current location as redirect parameter
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate 
      to={`/login?redirect=${encodeURIComponent(location.pathname)}`} 
      replace 
    />;
  }

  // Check if user has required role
  if (requiredRole && user.userType !== requiredRole) {
    console.log(`User role ${user.userType} doesn't match required role ${requiredRole}`);
    
    // Redirect based on user type
    if (user.userType === 'customer') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.userType === 'shop_owner') {
      return <Navigate to="/seller-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has correct role
  console.log('User authenticated successfully, rendering protected content');
  return children;
};

export default ProtectedRoute;