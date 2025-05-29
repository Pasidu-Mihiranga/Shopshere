import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Authentication/Login';
import Register from './pages/Authentication/Register';

// Temporary Home component (we'll create the actual one later)
const Home = () => <div>Home Page</div>;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;