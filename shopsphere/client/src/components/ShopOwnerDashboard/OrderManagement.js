import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('last30');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders/shop');
        setOrders(response.data);
        setFilteredOrders(response.data);
        setError('');
      } catch (error) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    // Apply filters
    filterOrders();
  }, [statusFilter, dateFilter, orders]);

  const filterOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 60)); // 90 days ago
    
    if (dateFilter === 'last30') {
      filtered = filtered.filter(order => new Date(order.createdAt) >= thirtyDaysAgo);
    } else if (dateFilter === 'last90') {
      filtered = filtered.filter(order => new Date(order.createdAt) >= ninetyDaysAgo);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      
      // Update orders in state
      const updatedOrders = orders.map(order => 
        order._id === orderId ? { ...order, status: response.data.status } : order
      );
      
      setOrders(updatedOrders);
      
      // If we're viewing order details, update current order
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder({ ...currentOrder, status: response.data.status });
      }
      
      setError('');
    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setCurrentOrder(response.data);
      setShowOrderDetail(true);
      setError('');
    } catch (error) {
      setError('Failed to fetch order details');
    }
  };

  const closeOrderDetails = () => {
    setShowOrderDetail(false);
    setCurrentOrder(null);
  };

  // Helper function to get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Helper function to get available status transitions
  const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['shipped', 'cancelled'];
      case 'shipped':
        return ['delivered'];
      case 'delivered':
      case 'cancelled':
        return [];
      default:
        return [];
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="order-management-container">
      <div className="order-management-header">
        <h2>Order Management</h2>
        <div className="order-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date:</label>
            <select value={dateFilter} onChange={handleDateFilterChange}>
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {showOrderDetail && currentOrder ? (
        <div className="order-detail">
          <div className="order-detail-header">
            <h3>Order #{currentOrder.orderNumber}</h3>
            <button className="btn-secondary" onClick={closeOrderDetails}>
              Back to Order List
            </button>
          </div>
          
          <div className="order-info">
            <div className="order-info-section">
              <h4>Order Information</h4>
              <p><strong>Date:</strong> {format(new Date(currentOrder.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              <p>
                <strong>Status:</strong> 
                <span className={getStatusClass(currentOrder.status)}>
                  {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                </span>
              </p>
              <p><strong>Total Amount:</strong> ${currentOrder.billing.total.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> {currentOrder.payment.method}</p>
              <p><strong>Payment Status:</strong> {currentOrder.payment.status}</p>
            </div>
            
            <div className="order-info-section">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> {currentOrder.customerName}</p>
              <p><strong>Email:</strong> {currentOrder.customerEmail}</p>
              <p><strong>Phone:</strong> {currentOrder.customerPhone || 'N/A'}</p>
            </div>
            
            <div className="order-info-section">
              <h4>Shipping Information</h4>
              <p><strong>Address:</strong> {currentOrder.shipping.address.street}</p>
              <p>{currentOrder.shipping.address.city}, {currentOrder.shipping.address.state} {currentOrder.shipping.address.zipCode}</p>
              <p>{currentOrder.shipping.address.country}</p>
              <p><strong>Shipping Method:</strong> {currentOrder.shipping.method}</p>
              {currentOrder.shipping.trackingNumber && (
                <p><strong>Tracking Number:</strong> {currentOrder.shipping.trackingNumber}</p>
              )}
              {currentOrder.shipping.estimatedDelivery && (
                <p>
                  <strong>Estimated Delivery:</strong> 
                  {format(new Date(currentOrder.shipping.estimatedDelivery.from), 'MMM dd')} - 
                  {format(new Date(currentOrder.shipping.estimatedDelivery.to), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          </div>
          
          <div className="order-items">
            <h4>Order Items</h4>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-info">
                        <img 
                          src={item.productImage || '/images/placeholder.png'} 
                          alt={item.productName} 
                          className="product-thumbnail"
                        />
                        <div>
                          <p className="product-name">{item.productName}</p>
                          {Object.keys(item.attributes || {}).length > 0 && (
                            <p className="product-attributes">
                              {Object.entries(item.attributes).map(([key, value]) => (
                                <span key={key}>{key}: {value}</span>
                              ))}
                            </p>
                          )}
                          <p className="product-sku">SKU: {item.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-right">Subtotal</td>
                  <td>${currentOrder.billing.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-right">Shipping</td>
                  <td>${currentOrder.billing.shipping.toFixed(2)}</td>
                </tr>
                {currentOrder.billing.discount > 0 && (
                  <tr>
                    <td colSpan="3" className="text-right">Discount</td>
                    <td>-${currentOrder.billing.discount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td colSpan="3" className="text-right">Total</td>
                  <td>${currentOrder.billing.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="order-actions">
            <h4>Order Actions</h4>
            <div className="status-update-form">
              <select 
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleUpdateStatus(currentOrder._id, e.target.value);
                  }
                }}
                disabled={getAvailableStatusOptions(currentOrder.status).length === 0}
              >
                <option value="">Update Status</option>
                {getAvailableStatusOptions(currentOrder.status).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              {currentOrder.status === 'processing' && (
                <div className="tracking-info">
                  <label>Add Tracking Number:</label>
                  <input type="text" placeholder="Enter tracking number" />
                  <button className="btn-secondary">Save Tracking</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <p>No orders found matching the selected filters.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order.orderNumber}</td>
                    <td>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                    <td>{order.customerName}</td>
                    <td>{order.items.reduce((total, item) => total + item.quantity, 0)}</td>
                    <td>${order.billing.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => viewOrderDetails(order._id)}
                        >
                          View
                        </button>
                        <select 
                          className="status-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateStatus(order._id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          disabled={getAvailableStatusOptions(order.status).length === 0}
                        >
                          <option value="">Status</option>
                          {getAvailableStatusOptions(order.status).map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;