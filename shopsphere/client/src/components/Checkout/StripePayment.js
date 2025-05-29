// src/components/Checkout/StripePayment.js
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../../services/paymentService';

const StripePayment = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const { clientSecret } = await createPaymentIntent(amount);
        setClientSecret(clientSecret);
      } catch (error) {
        setError('Could not initiate payment. Please try again.');
        onPaymentError('Payment initialization failed');
      }
    };
    
    if (amount > 0) {
      fetchPaymentIntent();
    }
  }, [amount, onPaymentError]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    const cardElement = elements.getElement(CardElement);
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Customer Name' // Ideally get this from form
        }
      }
    });
    
    if (error) {
      setError(error.message);
      onPaymentError(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="stripe-payment">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Card Details</label>
          <div className="card-element-container">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          className="btn-primary btn-pay"
          disabled={!stripe || loading}
          type="submit"
        >
          {loading ? 'Processing...' : `Pay ${amount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default StripePayment;