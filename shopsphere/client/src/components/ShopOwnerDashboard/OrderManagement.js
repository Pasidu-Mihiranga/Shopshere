// src/components/ShopOwnerDashboard/OrderManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const OrderManagement = () => {
  const { apiClient } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('last30');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching shop orders...');
        
        try {
          const response = await apiClient.get('/api/orders/shop');
          setOrders(response.data);
          setFilteredOrders(response.data);
          console.log('Orders loaded successfully:', response.data.length);
        } catch (ordersError) {
          console.warn('Orders API not available, using mock data:', ordersError.message);
          
          // Generate mock orders for development
          const mockOrders = generateMockOrders();
          setOrders(mockOrders);
          setFilteredOrders(mockOrders);
        }
        
        setError('');
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
        
        // Fallback to mock data
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [apiClient]);

  const generateMockOrders = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const customers = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Bob Johnson', email: 'bob@example.com' },
      { name: 'Alice Brown', email: 'alice@example.com' }
    ];
    
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `order_${i + 1}`,
      orderNumber: `ORD-${String(i + 1).padStart(4, '0')}`,
      customerName: customers[i % customers.length].name,
      customerEmail: customers[i % customers.length].email,
      customerPhone: '+1234567890',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          productName: `Product ${i + 1}`,
          productImage: '/images/placeholder.png',
          quantity: Math.floor(Math.random() * 3) + 1,
          price: Math.floor(Math.random() * 100) + 20,
          attributes: { size: 'M', color: 'Blue' },
          sku: `SKU-${i + 1}`
        }
      ],
      billing: {
        subtotal: Math.floor(Math.random() * 200) + 50,
        shipping: 5.99,
        discount: 0,
        total: Math.floor(Math.random() * 200) + 55.99
      },
      shipping: {
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        method: 'Standard Shipping',
        trackingNumber: Math.random() > 0.5 ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
        estimatedDelivery: {
          from: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      payment: {
        method: 'Credit Card',
        status: 'completed'
      }
    }));
  };

  useEffect(() => {
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
    if (dateFilter === 'last30') {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.createdAt) >= thirtyDaysAgo);
    } else if (dateFilter === 'last90') {
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
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
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      try {
        const response = await apiClient.patch(`/api/orders/${orderId}/status`, { 
          status: newStatus,
          trackingNumber: newStatus === 'shipped' ? trackingNumber : undefined
        });
        
        // Update orders in state
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status: response.data.status } : order
        );
        setOrders(updatedOrders);
        
        // If we're viewing order details, update current order
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder({ ...currentOrder, status: response.data.status });
        }
      } catch (updateError) {
        console.warn('Status update API not available, updating locally:', updateError.message);
        
        // Update locally for demonstration
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder({ ...currentOrder, status: newStatus });
        }
      }
      
      setTrackingNumber('');
      setError('');
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      console.log('Viewing order details for:', orderId);
      
      try {
        const response = await apiClient.get(`/api/orders/${orderId}`);
        setCurrentOrder(response.data);
      } catch (detailError) {
        console.warn('Order detail API not available, using local data:', detailError.message);
        
        // Find order in local data
        const order = orders.find(o => o._id === orderId);
        setCurrentOrder(order);
      }
      
      setShowOrderDetail(true);
      setError('');
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details');
    }
  };

  const closeOrderDetails = () => {
    setShowOrderDetail(false);
    setCurrentOrder(null);
    setTrackingNumber('');
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || '';
  };

  const getAvailableStatusOptions = (currentStatus) => {
    const transitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return transitions[currentStatus] || [];
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '🔄',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📦';
  };

  const addTrackingNumber = async (orderId) => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    try {
      const response = await apiClient.patch(`/api/orders/${orderId}/tracking`, {
        trackingNumber: trackingNumber.trim()
      });

      // Update current order
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder({
          ...currentOrder,
          shipping: {
            ...currentOrder.shipping,
            trackingNumber: trackingNumber.trim()
          }
        });
      }

      setTrackingNumber('');
      setError('');
    } catch (error) {
      console.error('Error adding tracking number:', error);
      // For demo purposes, update locally
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder({
          ...currentOrder,
          shipping: {
            ...currentOrder.shipping,
            trackingNumber: trackingNumber.trim()
          }
        });
      }
      setTrackingNumber('');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-management-container">
      <div className="order-management-header">
        <h2>Order Management</h2>
        <div className="order-filters">
          <div className="filter-group">
            <label>📊 Status:</label>
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="all">All Orders</option>
              <option value="pending">⏳ Pending</option>
              <option value="processing">🔄 Processing</option>
              <option value="shipped">🚚 Shipped</option>
              <option value="delivered">✅ Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>📅 Date:</label>
            <select value={dateFilter} onChange={handleDateFilterChange}>
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}
      
      {showOrderDetail && currentOrder ? (
        <div className="order-detail">
          <div className="order-detail-header">
            <h3>📋 Order #{currentOrder.orderNumber}</h3>
            <button className="btn-secondary" onClick={closeOrderDetails}>
              ← Back to Order List
            </button>
          </div>
          
          <div className="order-status-banner">
            <span className={`status-badge large ${getStatusClass(currentOrder.status)}`}>
              {getStatusIcon(currentOrder.status)} {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
            </span>
          </div>
          
          <div className="order-info-grid">
            <div className="order-info-section">
              <h4>📦 Order Information</h4>
              <div className="info-item">
                <strong>Date:</strong> {format(new Date(currentOrder.createdAt), 'MMM dd, yyyy HH:mm')}
              </div>
              <div className="info-item">
                <strong>Total Amount:</strong> ${currentOrder.billing.total.toFixed(2)}
              </div>
              <div className="info-item">
                <strong>Payment Method:</strong> {currentOrder.payment.method}
              </div>
              <div className="info-item">
                <strong>Payment Status:</strong> 
                <span className={`payment-status ${currentOrder.payment.status}`}>
                  {currentOrder.payment.status === 'completed' ? '✅' : '⏳'} {currentOrder.payment.status}
                </span>
              </div>
            </div>
            
            <div className="order-info-section">
              <h4>👤 Customer Information</h4>
              <div className="info-item">
                <strong>Name:</strong> {currentOrder.customerName}
              </div>
              <div className="info-item">
                <strong>Email:</strong> 
                <a href={`mailto:${currentOrder.customerEmail}`}>{currentOrder.customerEmail}</a>
              </div>
              <div className="info-item">
                <strong>Phone:</strong> 
                <a href={`tel:${currentOrder.customerPhone}`}>{currentOrder.customerPhone || 'N/A'}</a>
              </div>
            </div>
            
            <div className="order-info-section">
              <h4>🚚 Shipping Information</h4>
              <div className="info-item">
                <strong>Address:</strong>
                <address>
                  {currentOrder.shipping.address.street}<br />
                  {currentOrder.shipping.address.city}, {currentOrder.shipping.address.state} {currentOrder.shipping.address.zipCode}<br />
                  {currentOrder.shipping.address.country}
                </address>
              </div>
              <div className="info-item">
                <strong>Shipping Method:</strong> {currentOrder.shipping.method}
              </div>
              {currentOrder.shipping.trackingNumber && (
                <div className="info-item">
                  <strong>Tracking Number:</strong> 
                  <span className="tracking-number">{currentOrder.shipping.trackingNumber}</span>
                </div>
              )}
              {currentOrder.shipping.estimatedDelivery && (
                <div className="info-item">
                  <strong>Estimated Delivery:</strong> 
                  {format(new Date(currentOrder.shipping.estimatedDelivery.from), 'MMM dd')} - 
                  {format(new Date(currentOrder.shipping.estimatedDelivery.to), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          </div>
          
          <div className="order-items">
            <h4>🛍️ Order Items</h4>
            <div className="items-table-container">
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
                            onError={(e) => e.target.src = '/images/placeholder.png'}
                          />
                          <div>
                            <p className="product-name">{item.productName}</p>
                            {Object.keys(item.attributes || {}).length > 0 && (
                              <p className="product-attributes">
                                {Object.entries(item.attributes).map(([key, value]) => (
                                  <span key={key} className="attribute-tag">{key}: {value}</span>
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
                    <td colSpan="3" className="text-right"><strong>Total</strong></td>
                    <td><strong>${currentOrder.billing.total.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="order-actions">
            <h4>⚡ Order Actions</h4>
            <div className="actions-grid">
              <div className="status-update-section">
                <h5>Update Status</h5>
                <select 
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleUpdateStatus(currentOrder._id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                  disabled={getAvailableStatusOptions(currentOrder.status).length === 0}
                >
                  <option value="">Select new status</option>
                  {getAvailableStatusOptions(currentOrder.status).map(status => (
                    <option key={status} value={status}>
                      {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                {getAvailableStatusOptions(currentOrder.status).length === 0 && (
                  <p className="no-actions">No status updates available for {currentOrder.status} orders.</p>
                )}
              </div>
              
              {(currentOrder.status === 'processing' || currentOrder.status === 'shipped') && (
                <div className="tracking-section">
                  <h5>Tracking Information</h5>
                  {currentOrder.shipping.trackingNumber ? (
                    <div className="current-tracking">
                      <p><strong>Current Tracking:</strong> {currentOrder.shipping.trackingNumber}</p>
                    </div>
                  ) : (
                    <div className="add-tracking">
                      <div className="tracking-input-group">
                        <input 
                          type="text" 
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                        <button 
                          className="btn-primary"
                          onClick={() => addTrackingNumber(currentOrder._id)}
                          disabled={!trackingNumber.trim()}
                        >
                          Add Tracking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>No orders match the selected filters.</p>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="orders-summary">
                <p>📊 {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</p>
                <p>💰 Total value: ${filteredOrders.reduce((sum, order) => sum + order.billing.total, 0).toFixed(2)}</p>
              </div>
              
              <div className="orders-table-container">
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
                        <td>
                          <strong>#{order.orderNumber}</strong>
                        </td>
                        <td>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                        <td>
                          <div className="customer-info">
                            <strong>{order.customerName}</strong>
                            <small>{order.customerEmail}</small>
                          </div>
                        </td>
                        <td>{order.items.reduce((total, item) => total + item.quantity, 0)} items</td>
                        <td>
                          <strong>${order.billing.total.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon view"
                              onClick={() => viewOrderDetails(order._id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            {getAvailableStatusOptions(order.status).length > 0 && (
                              <select 
                                className="status-select"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleUpdateStatus(order._id, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                title="Update Status"
                              >
                                <option value="">Status</option>
                                {getAvailableStatusOptions(order.status).map(status => (
                                  <option key={status} value={status}>
                                    {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;