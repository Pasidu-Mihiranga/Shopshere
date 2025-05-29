// src/services/paymentService.js
import axios from 'axios';

export const createPaymentIntent = async (amount, currency = 'usd') => {
  try {
    const response = await axios.post('/api/payments/create-intent', {
      amount,
      currency
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const confirmCardPayment = async (clientSecret, paymentMethod) => {
  try {
    const response = await axios.post('/api/payments/confirm-payment', {
      clientSecret,
      paymentMethod
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentMethod = async (cardDetails) => {
  try {
    const response = await axios.post('/api/payments/create-payment-method', cardDetails);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};