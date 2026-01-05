import React, { useState, useEffect } from 'react';
import './OrderDetailsPerDay.css';

const OrderDetailsPerDay = ({ businessId, date, user, onBack }) => {
  const [ordersData, setOrdersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!businessId || !date) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Prepare headers with authorization token
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if token is available
        const authToken = user?.token || localStorage.getItem('token') || localStorage.getItem('authToken');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`/api/orders-per-day/${businessId}/details?date=${date}`, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order details: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setOrdersData(Array.isArray(data.data) ? data.data : []);
        } else {
          setOrdersData([]);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
        setOrdersData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [businessId, date, user]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'completed') {
      return 'status-delivered';
    } else if (statusLower === 'in progress' || statusLower === 'inprogress' || statusLower === 'processing') {
      return 'status-in-progress';
    } else {
      return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'completed') {
      return 'Delivered';
    } else if (statusLower === 'in progress' || statusLower === 'inprogress' || statusLower === 'processing') {
      return 'In Progress';
    } else {
      return 'Pending';
    }
  };

  if (isLoading) {
    return (
      <div className="order-details-per-day-container">
        <div className="order-details-per-day-loading">
          <div className="order-details-per-day-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-per-day-container">
        <div className="order-details-per-day-error">
          <p>Error: {error}</p>
          {onBack && (
            <button onClick={onBack} className="order-details-per-day-back-button">
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-per-day-container">
      {/* Header */}
      <header className="order-details-per-day-header">
        <div className="order-details-per-day-header-content">
          <div className="order-details-per-day-header-left">
            {onBack && (
              <button onClick={onBack} className="order-details-per-day-back-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <h1 className="order-details-per-day-title">Order Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="order-details-per-day-main">
        <div className="order-details-per-day-content">
          {/* Date Header */}
          <div className="order-details-per-day-date-header">
            <h2 className="order-details-per-day-date-title">{formatDate(date)}</h2>
            <span className="order-details-per-day-order-count">
              {ordersData.length} {ordersData.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {/* Orders List */}
          {ordersData.length === 0 ? (
            <div className="order-details-per-day-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <h3>No orders for this date</h3>
              <p>There are no orders scheduled for {formatDate(date)}</p>
            </div>
          ) : (
            <div className="order-details-per-day-orders-list">
              {ordersData.map((order) => (
                <div key={order.orderId} className="order-details-per-day-order-card">
                  <div className="order-details-per-day-order-header">
                    <div className="order-details-per-day-order-id-section">
                      <span className="order-details-per-day-order-id">#ORD-{order.orderId}</span>
                      <span className={`order-details-per-day-order-status ${getStatusClass(order.paymentStatus || order.status)}`}>
                        {getStatusText(order.paymentStatus || order.status)}
                      </span>
                    </div>
                    <div className="order-details-per-day-order-amount">
                      ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                    </div>
                  </div>

                  <div className="order-details-per-day-order-info">
                    <div className="order-details-per-day-info-row">
                      <span className="order-details-per-day-info-label">Order Date:</span>
                      <span className="order-details-per-day-info-value">{formatOrderDate(order.orderDate)}</span>
                    </div>
                    {order.customerId && (
                      <div className="order-details-per-day-info-row">
                        <span className="order-details-per-day-info-label">Customer ID:</span>
                        <span className="order-details-per-day-info-value">#{order.customerId}</span>
                      </div>
                    )}
                    {order.orderType && (
                      <div className="order-details-per-day-info-row">
                        <span className="order-details-per-day-info-label">Order Type:</span>
                        <span className="order-details-per-day-info-value">{order.orderType}</span>
                      </div>
                    )}
                    {order.deliveryDate && (
                      <div className="order-details-per-day-info-row">
                        <span className="order-details-per-day-info-label">Delivery Date:</span>
                        <span className="order-details-per-day-info-value">{formatOrderDate(order.deliveryDate)}</span>
                      </div>
                    )}
                    {order.advancePaid > 0 && (
                      <div className="order-details-per-day-info-row">
                        <span className="order-details-per-day-info-label">Advance Paid:</span>
                        <span className="order-details-per-day-info-value">₹{order.advancePaid.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="order-details-per-day-order-items">
                      <h4 className="order-details-per-day-order-items-title">Order Items ({order.orderItems.length})</h4>
                      <div className="order-details-per-day-items-list">
                        {order.orderItems.map((item, index) => (
                          <div key={item.orderItemId || index} className="order-details-per-day-item">
                            <div className="order-details-per-day-item-header">
                              <span className="order-details-per-day-item-name">
                                {item.description || item.itemType || 'Order Item'}
                              </span>
                              <span className={`order-details-per-day-item-status ${getStatusClass(item.status)}`}>
                                {getStatusText(item.status)}
                              </span>
                            </div>
                            <div className="order-details-per-day-item-details">
                              {item.itemType && (
                                <span className="order-details-per-day-item-type">{item.itemType}</span>
                              )}
                              <span className="order-details-per-day-item-quantity">
                                Qty: {item.quantity || 1} {item.unit || 'piece'}
                              </span>
                              <span className="order-details-per-day-item-price">
                                ₹{item.itemTotal?.toLocaleString('en-IN') || item.unitPrice?.toLocaleString('en-IN') || '0'}
                              </span>
                            </div>
                            {item.measurementDate && (
                              <div className="order-details-per-day-item-measurement">
                                <span className="order-details-per-day-measurement-label">Measurement:</span>
                                <span className="order-details-per-day-measurement-value">
                                  {formatOrderDate(item.measurementDate)}
                                  {item.measurementSlot && ` (${item.measurementSlot})`}
                                </span>
                              </div>
                            )}
                            {item.stitchingDate && (
                              <div className="order-details-per-day-item-measurement">
                                <span className="order-details-per-day-measurement-label">Stitching:</span>
                                <span className="order-details-per-day-measurement-value">
                                  {formatOrderDate(item.stitchingDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetailsPerDay;

