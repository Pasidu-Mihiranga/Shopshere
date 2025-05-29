// src/components/CustomerDashboard/Orders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
        setError('');
      } catch (error) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.orderNumber}</h3>
                <span className={`status status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-info">
                <p>Date: {format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                <p>Total: ${order.billing.total.toFixed(2)}</p>
                {order.shipping.estimatedDelivery && (
                  <p>
                    Estimated Delivery: 
                    {format(new Date(order.shipping.estimatedDelivery.from), 'MMM dd')} - 
                    {format(new Date(order.shipping.estimatedDelivery.to), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
              <div className="order-items">
                <h4>Items ({order.items.length})</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.productName} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-actions">
                <button className="btn-secondary">View Details</button>
                {order.status === 'delivered' && (
                  <button className="btn-outline">Write a Review</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;