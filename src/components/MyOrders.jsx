import React, { useState, useEffect } from 'react';
import './MyOrders.css';

const MyOrders = ({ user, onBack }) => {
  const [ordersData, setOrdersData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedMeasurements, setExpandedMeasurements] = useState({}); // Track expanded measurements by orderItemId

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
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

        // Build query string
        let url = '/api/my-orders';
        if (selectedDate) {
          url += `?date=${selectedDate}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setOrdersData(data.data);
        } else {
          setOrdersData(null);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setOrdersData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, selectedDate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const parseMeasurements = (measurementsString) => {
    if (!measurementsString) return null;
    try {
      // Handle both JSON string and array formats
      if (typeof measurementsString === 'string') {
        const parsed = JSON.parse(measurementsString);
        return Array.isArray(parsed) ? parsed : null;
      }
      if (Array.isArray(measurementsString)) {
        return measurementsString;
      }
      return null;
    } catch (e) {
      console.error('Error parsing measurements:', e);
      return null;
    }
  };

  const isMeasurementDone = (item) => {
    return item.isMeasurementDone === true || 
           item.isMeasurementDone === 1 || 
           item.isMeasurementDone === '1';
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

  const handleDateFilterChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="my-orders-container">
        <div className="my-orders-loading">
          <div className="my-orders-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-container">
        <div className="my-orders-error">
          <p>Error: {error}</p>
          {onBack && (
            <button onClick={onBack} className="my-orders-back-button">
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      {/* Header */}
      <header className="my-orders-header">
        <div className="my-orders-header-content">
          <div className="my-orders-header-left">
            {onBack && (
              <button onClick={onBack} className="my-orders-back-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <h1 className="my-orders-title">My Orders</h1>
          </div>
          <div className="my-orders-header-actions">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateFilterChange}
              className="my-orders-date-filter"
              placeholder="Filter by date"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="my-orders-main">
        <div className="my-orders-content">
          {ordersData && (
            <>
              {/* Summary Header */}
              <div className="my-orders-summary">
                <div className="my-orders-summary-info">
                  <h2 className="my-orders-business-name">{ordersData.businessName || 'My Business'}</h2>
                  <div className="my-orders-meta">
                    {ordersData.userRoles && ordersData.userRoles.length > 0 && (
                      <span className="my-orders-role">
                        {ordersData.userRoles.join(', ')}
                      </span>
                    )}
                    {ordersData.businessId && (
                      <span className="my-orders-business-id">
                        Business ID: {ordersData.businessId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="my-orders-total">
                  <span className="my-orders-total-label">Total Orders</span>
                  <span className="my-orders-total-value">{ordersData.totalOrders || 0}</span>
                </div>
              </div>

              {/* Orders List */}
              {!ordersData.orders || ordersData.orders.length === 0 ? (
                <div className="my-orders-empty">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <h3>No orders found</h3>
                  <p>{selectedDate ? `No orders found for the selected date` : 'You don\'t have any orders yet'}</p>
                </div>
              ) : (
                <div className="my-orders-list">
                  {ordersData.orders.map((order) => (
                    <div key={order.orderId} className="my-orders-order-card">
                      <div className="my-orders-order-header">
                        <div className="my-orders-order-id-section">
                          <span className="my-orders-order-id">#ORD-{order.orderId}</span>
                          <span className={`my-orders-order-status ${getStatusClass(order.paymentStatus || order.status)}`}>
                            {getStatusText(order.paymentStatus || order.status)}
                          </span>
                        </div>
                        <div className="my-orders-order-amount">
                          ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                        </div>
                      </div>

                      <div className="my-orders-order-info">
                        <div className="my-orders-info-row">
                          <span className="my-orders-info-label">Order Date:</span>
                          <span className="my-orders-info-value">{formatOrderDate(order.orderDate)}</span>
                        </div>
                        {order.customerId && (
                          <div className="my-orders-info-row">
                            <span className="my-orders-info-label">Customer ID:</span>
                            <span className="my-orders-info-value">#{order.customerId}</span>
                          </div>
                        )}
                        {order.orderType && (
                          <div className="my-orders-info-row">
                            <span className="my-orders-info-label">Order Type:</span>
                            <span className="my-orders-info-value">{order.orderType}</span>
                          </div>
                        )}
                        {order.deliveryDate && (
                          <div className="my-orders-info-row">
                            <span className="my-orders-info-label">Delivery Date:</span>
                            <span className="my-orders-info-value">{formatOrderDate(order.deliveryDate)}</span>
                          </div>
                        )}
                        {order.advancePaid > 0 && (
                          <div className="my-orders-info-row">
                            <span className="my-orders-info-label">Advance Paid:</span>
                            <span className="my-orders-info-value">₹{order.advancePaid.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="my-orders-info-row full-width">
                            <span className="my-orders-info-label">Notes:</span>
                            <span className="my-orders-info-value">{order.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      {order.orderItems && order.orderItems.length > 0 && (
                        <div className="my-orders-order-items">
                          <h4 className="my-orders-order-items-title">Order Items ({order.orderItems.length})</h4>
                          <div className="my-orders-items-list">
                            {order.orderItems.map((item, index) => (
                              <div key={item.orderItemId || index} className="my-orders-item">
                                <div className="my-orders-item-header">
                                  <span className="my-orders-item-name">
                                    {item.description || item.itemType || 'Order Item'}
                                  </span>
                                  <span className={`my-orders-item-status ${getStatusClass(item.status)}`}>
                                    {getStatusText(item.status)}
                                  </span>
                                </div>
                                <div className="my-orders-item-details">
                                  <div className="my-orders-item-details-row">
                                    {item.itemType && (
                                      <span className="my-orders-item-type">
                                        <strong>Type:</strong> {item.itemType}
                                      </span>
                                    )}
                                    {item.productCode && (
                                      <span className="my-orders-item-code">
                                        <strong>Code:</strong> {item.productCode}
                                      </span>
                                    )}
                                  </div>
                                  <div className="my-orders-item-details-row">
                                    <span className="my-orders-item-quantity">
                                      <strong>Quantity:</strong> {item.quantity || 1} {item.unit || 'piece'}
                                    </span>
                                    <span className="my-orders-item-unit-price">
                                      <strong>Unit Price:</strong> ₹{item.unitPrice?.toLocaleString('en-IN') || '0'}
                                    </span>
                                    <span className="my-orders-item-price">
                                      <strong>Total:</strong> ₹{item.itemTotal?.toLocaleString('en-IN') || '0'}
                                    </span>
                                  </div>
                                </div>
                                {item.measurementDate && (
                                  <div className="my-orders-item-measurement">
                                    <span className="my-orders-measurement-label">Measurement:</span>
                                    <span className="my-orders-measurement-value">
                                      {formatOrderDate(item.measurementDate)}
                                      {item.measurementSlot && ` (${item.measurementSlot})`}
                                    </span>
                                  </div>
                                )}
                                {item.stitchingDate && (
                                  <div className="my-orders-item-measurement">
                                    <span className="my-orders-measurement-label">Stitching:</span>
                                    <span className="my-orders-measurement-value">
                                      {formatOrderDate(item.stitchingDate)}
                                    </span>
                                  </div>
                                )}
                                {isMeasurementDone(item) && (
                                  <div className="my-orders-measurement-status-section">
                                    <div className="my-orders-measurement-status-row">
                                      <span className="my-orders-measurement-done-badge">
                                        ✓ Measurement Done
                                      </span>
                                      {item.measurements && (
                                        <button
                                          className="my-orders-view-measurements-btn"
                                          onClick={() => {
                                            const itemId = item.orderItemId;
                                            setExpandedMeasurements(prev => ({
                                              ...prev,
                                              [itemId]: !prev[itemId]
                                            }));
                                          }}
                                        >
                                          {expandedMeasurements[item.orderItemId] ? (
                                            <>
                                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="18 15 12 9 6 15"></polyline>
                                              </svg>
                                              Hide Measurements
                                            </>
                                          ) : (
                                            <>
                                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                              </svg>
                                              View Measurements
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                    {expandedMeasurements[item.orderItemId] && item.measurements && (
                                      <div className="my-orders-measurements-list">
                                        {(() => {
                                          const measurements = parseMeasurements(item.measurements);
                                          if (measurements && measurements.length > 0) {
                                            // Get the first note (if any) to display once
                                            const firstNote = measurements.find(m => m.notes)?.notes;
                                            
                                            return (
                                              <>
                                                {measurements.map((measurement, idx) => (
                                                  <div key={idx} className="my-orders-measurement-item">
                                                    <span className="my-orders-measurement-key">
                                                      {measurement.measurementKey || measurement.key}:
                                                    </span>
                                                    <span className="my-orders-measurement-value">
                                                      {measurement.measurementValue || measurement.value}
                                                      {measurement.unit && ` ${measurement.unit}`}
                                                    </span>
                                                  </div>
                                                ))}
                                                {firstNote && (
                                                  <div className="my-orders-measurement-notes-section">
                                                    <span className="my-orders-measurement-notes-label">Notes:</span>
                                                    <span className="my-orders-measurement-notes">{firstNote}</span>
                                                  </div>
                                                )}
                                              </>
                                            );
                                          }
                                          return <p className="my-orders-no-measurements">No measurements available</p>;
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {item.notes && (
                                  <div className="my-orders-item-measurement">
                                    <span className="my-orders-measurement-label">Notes:</span>
                                    <span className="my-orders-measurement-value">{item.notes}</span>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyOrders;

