// src/components/Checkout/PayPalPayment.js
import React, { useEffect } from 'react';

const PayPalPayment = ({ amount, onPaymentSuccess, onPaymentError }) => {
  useEffect(() => {
    const addPayPalScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}`;
      script.async = true;
      script.onload = () => {
        initializePayPal();
      };
      document.body.appendChild(script);
    };
    
    const initializePayPal = () => {
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: 'USD',
                    value: amount.toFixed(2)
                  }
                }
              ]
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            onPaymentSuccess(order.id);
          },
          onError: (err) => {
            onPaymentError('PayPal payment failed');
            console.error('PayPal Error:', err);
          }
        })
        .render('#paypal-button-container');
    };
    
    if (window.paypal) {
      initializePayPal();
    } else {
      addPayPalScript();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [amount, onPaymentSuccess, onPaymentError]);
  
  return (
    <div className="paypal-payment">
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PayPalPayment;