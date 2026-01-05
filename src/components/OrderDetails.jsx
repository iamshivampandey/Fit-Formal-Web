import React, { useState, useEffect } from 'react';
import './OrderDetails.css';

const OrderDetails = ({ orderId, user, onBack }) => {
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) {
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
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setOrderData(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
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

  const formatDateShort = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
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
      <div className="order-details-container">
        <div className="order-details-loading">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-container">
        <div className="order-details-error">
          <p>Error: {error}</p>
          <button onClick={onBack} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!orderData || !orderData.order) {
    return (
      <div className="order-details-container">
        <div className="order-details-error">
          <p>Order not found</p>
          <button onClick={onBack} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { order, orderItems = [], deliveryAddress } = orderData;

  return (
    <div className="order-details-container">
      {/* Header */}
      <header className="order-details-header">
        <div className="order-details-header-content">
          {onBack && (
            <button
              onClick={onBack}
              className="order-details-back-button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <h1 className="order-details-title">Order Details</h1>
          <div className="header-spacer"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="order-details-main">
        <div className="order-details-content">
          {/* Order Info Card */}
          <div className="order-details-card">
            <div className="order-details-card-header">
              <h2 className="order-details-card-title">Order Information</h2>
              <span className={`order-status-badge ${getStatusClass(order.paymentStatus)}`}>
                {getStatusText(order.paymentStatus)}
              </span>
            </div>
            <div className="order-details-info-grid">
              <div className="order-details-info-item">
                <span className="info-label">Order ID:</span>
                <span className="info-value">#ORD-{order.orderId}</span>
              </div>
              <div className="order-details-info-item">
                <span className="info-label">Order Date:</span>
                <span className="info-value">{formatDate(order.orderDate)}</span>
              </div>
              <div className="order-details-info-item">
                <span className="info-label">Order Type:</span>
                <span className="info-value">{order.orderType}</span>
              </div>
              <div className="order-details-info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value amount">₹{order.totalAmount?.toLocaleString('en-IN') || '0'}</span>
              </div>
              <div className="order-details-info-item">
                <span className="info-label">Payment Status:</span>
                <span className={`info-value ${getStatusClass(order.paymentStatus)}`}>
                  {getStatusText(order.paymentStatus)}
                </span>
              </div>
              {order.advancePaid > 0 && (
                <div className="order-details-info-item">
                  <span className="info-label">Advance Paid:</span>
                  <span className="info-value">₹{order.advancePaid.toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.deliveryDate && (
                <div className="order-details-info-item">
                  <span className="info-label">Delivery Date:</span>
                  <span className="info-value">{formatDate(order.deliveryDate)}</span>
                </div>
              )}
              {order.notes && (
                <div className="order-details-info-item full-width">
                  <span className="info-label">Notes:</span>
                  <span className="info-value">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Card */}
          {orderItems.length > 0 && (
            <div className="order-details-card">
              <h2 className="order-details-card-title">Order Items ({orderItems.length})</h2>
              <div className="order-items-list">
                {orderItems.map((item) => (
                  <div key={item.orderItemId} className="order-item-card">
                    <div className="order-item-header">
                      <h3 className="order-item-name">{item.description || item.itemType}</h3>
                      <span className={`order-item-status ${getStatusClass(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <div className="order-item-details">
                      <div className="order-item-row">
                        <span className="order-item-label">Type:</span>
                        <span className="order-item-value">{item.itemType}</span>
                      </div>
                      {item.productCode && (
                        <div className="order-item-row">
                          <span className="order-item-label">Product Code:</span>
                          <span className="order-item-value">{item.productCode}</span>
                        </div>
                      )}
                      <div className="order-item-row">
                        <span className="order-item-label">Quantity:</span>
                        <span className="order-item-value">{item.quantity} {item.unit || 'piece'}</span>
                      </div>
                      <div className="order-item-row">
                        <span className="order-item-label">Unit Price:</span>
                        <span className="order-item-value">₹{item.unitPrice?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                      <div className="order-item-row">
                        <span className="order-item-label">Total:</span>
                        <span className="order-item-value amount">₹{item.itemTotal?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                      {item.measurementDate && (
                        <div className="order-item-row">
                          <span className="order-item-label">Measurement Date:</span>
                          <span className="order-item-value">{formatDate(item.measurementDate)}</span>
                        </div>
                      )}
                      {item.measurementSlot && (
                        <div className="order-item-row">
                          <span className="order-item-label">Measurement Slot:</span>
                          <span className="order-item-value">{item.measurementSlot}</span>
                        </div>
                      )}
                      {item.stitchingDate && (
                        <div className="order-item-row">
                          <span className="order-item-label">Stitching Date:</span>
                          <span className="order-item-value">{formatDate(item.stitchingDate)}</span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="order-item-row full-width">
                          <span className="order-item-label">Notes:</span>
                          <span className="order-item-value">{item.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Address Card */}
          {deliveryAddress && (
            <div className="order-details-card">
              <h2 className="order-details-card-title">Delivery Address</h2>
              <div className="delivery-address-content">
                <div className="address-line">
                  <strong>{deliveryAddress.fullName}</strong>
                </div>
                <div className="address-line">
                  {deliveryAddress.phoneNumber}
                  {deliveryAddress.alternatePhone && ` / ${deliveryAddress.alternatePhone}`}
                </div>
                <div className="address-line">
                  {deliveryAddress.addressLine1}
                  {deliveryAddress.addressLine2 && `, ${deliveryAddress.addressLine2}`}
                </div>
                {deliveryAddress.landmark && (
                  <div className="address-line">
                    Near {deliveryAddress.landmark}
                  </div>
                )}
                <div className="address-line">
                  {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                </div>
                {deliveryAddress.addressType && (
                  <div className="address-line">
                    <span className="address-type-badge">{deliveryAddress.addressType}</span>
                  </div>
                )}
                {deliveryAddress.deliveryInstructions && (
                  <div className="address-line instructions">
                    <strong>Delivery Instructions:</strong> {deliveryAddress.deliveryInstructions}
                  </div>
                )}
                {deliveryAddress.googleMapLink && (
                  <div className="address-line">
                    <a 
                      href={deliveryAddress.googleMapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;

