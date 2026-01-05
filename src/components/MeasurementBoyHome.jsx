import { useState, useEffect } from 'react';
import './MeasurementBoyHome.css';

const MeasurementBoyHome = ({ user, onLogout, onNavigateToProfile }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [measurementData, setMeasurementData] = useState({});
  const [customAttributes, setCustomAttributes] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'

  // Fetch measurement orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        // Build query parameters based on filter status
        // Backend expects: null for all, 0 for pending, 1 for completed
        const queryParams = new URLSearchParams();
        
        if (filterStatus === 'pending') {
          queryParams.append('isOrderMeasurementDone', '0');
        } else if (filterStatus === 'completed') {
          queryParams.append('isOrderMeasurementDone', '1');
        } else {
          // For 'all', send 'null' as string (backend should parse it as null)
          queryParams.append('isOrderMeasurementDone', 'null');
        }
        
        const queryString = queryParams.toString();
        const apiUrl = `/api/measurement-boy/orders?${queryString}`;

        console.log('📞 Fetching measurement orders from:', apiUrl);
        console.log('👤 User ID:', user?.id || user?.userId);
        console.log('🔍 Filter Status:', filterStatus);
        console.log('📋 Full URL:', apiUrl);
        console.log('📦 Query Parameters:', Object.fromEntries(queryParams.entries()));
        console.log('📤 isOrderMeasurementDone payload:', filterStatus === 'pending' ? '0' : filterStatus === 'completed' ? '1' : 'null');
        
        // API to get measurement orders for measurement boy
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: headers,
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Measurement orders data:', data);
        
        if (data.success && data.data) {
          // Handle the response structure: data.data.orders
          const ordersArray = data.data.orders && Array.isArray(data.data.orders) 
            ? data.data.orders 
            : (Array.isArray(data.data) ? data.data : []);
          console.log('📦 Orders count:', ordersArray.length);
          setOrders(ordersArray);
        } else {
          console.warn('⚠️ No orders data in response');
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching measurement orders:', error);
        setError(error.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, filterStatus]);

  const parseMeasurements = (measurements) => {
    // Handle both array and JSON string formats
    if (!measurements) return null;
    
    // If it's already an array, return it
    if (Array.isArray(measurements)) {
      return measurements;
    }
    
    // If it's a string, try to parse it
    if (typeof measurements === 'string') {
      try {
        const parsed = JSON.parse(measurements);
        return Array.isArray(parsed) ? parsed : null;
      } catch (e) {
        console.error('Error parsing measurements:', e);
        return null;
      }
    }
    
    return null;
  };

  const hasMeasurements = (item) => {
    if (!item.measurements) return false;
    const parsed = parseMeasurements(item.measurements);
    return parsed && parsed.length > 0;
  };

  const isOrderMeasurementDone = (order) => {
    // Check order-level isOrderMeasurementDone field
    return order.isOrderMeasurementDone === true || 
           order.isOrderMeasurementDone === 1 || 
           order.isOrderMeasurementDone === '1';
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'all') {
      // Show all orders regardless of isOrderMeasurementDone
      return orders;
    } else if (filterStatus === 'completed') {
      // Show only orders where isOrderMeasurementDone is true or 1
      return orders.filter(order => 
        order.isOrderMeasurementDone === true || 
        order.isOrderMeasurementDone === 1 || 
        order.isOrderMeasurementDone === '1'
      );
    } else if (filterStatus === 'pending') {
      // Show only orders where isOrderMeasurementDone is false, 0, null, or undefined
      return orders.filter(order => 
        order.isOrderMeasurementDone === false || 
        order.isOrderMeasurementDone === 0 || 
        order.isOrderMeasurementDone === '0' ||
        order.isOrderMeasurementDone === null ||
        order.isOrderMeasurementDone === undefined
      );
    }
    return orders;
  };

  const handleTakeMeasurement = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setShowMeasurementForm(true);
    
    // Initialize measurement data for this item
    const baseData = {
      orderId: order.orderId,
      orderItemId: item.orderItemId,
      itemType: item.itemType
    };

    // Parse existing measurements if available
    const existingMeasurements = parseMeasurements(item.measurements);
    const standardFields = {};
    const customAttrs = [];

    if (existingMeasurements && existingMeasurements.length > 0) {
      existingMeasurements.forEach((measurement, index) => {
        const key = measurement.measurementKey?.toLowerCase().replace(/\s+/g, '');
        const value = measurement.measurementValue;
        
        // Map to standard field names (case-insensitive)
        // Only include fields that exist in the standard measurement form
        const fieldMap = {
          'chest': 'chest',
          'waist': 'waist',
          'hip': 'hip',
          'shoulder': 'shoulder',
          'neck': 'neck',
          'sleevelength': 'sleeveLength',
          'sleeve_length': 'sleeveLength',
          'shirtlength': 'shirtLength',
          'shirt_length': 'shirtLength',
          'pantlength': 'pantLength',
          'pant_length': 'pantLength',
          'inseam': 'inseam',
          'thigh': 'thigh'
        };

        if (fieldMap[key]) {
          // Standard measurement field
          standardFields[fieldMap[key]] = value;
        } else {
          // Custom attribute - use original key name (e.g., "LEG", "ARMHOLE", etc.)
          customAttrs.push({
            id: Date.now() + index,
            name: measurement.measurementKey, // Keep original case (e.g., "LEG")
            value: value
          });
        }

        // Add notes if available (use the last note if multiple)
        if (measurement.notes) {
          standardFields.notes = measurement.notes;
        }
      });
    }

    setMeasurementData({ ...baseData, ...standardFields });
    setCustomAttributes(customAttrs);
    
    console.log('📝 Parsed measurements:', {
      standardFields,
      customAttrs,
      existingMeasurements
    });
  };

  const handleAddCustomAttribute = () => {
    setCustomAttributes([...customAttributes, { id: Date.now(), name: '', value: '' }]);
  };

  const handleRemoveCustomAttribute = (id) => {
    setCustomAttributes(customAttributes.filter(attr => attr.id !== id));
  };

  const handleCustomAttributeChange = (id, field, value) => {
    setCustomAttributes(customAttributes.map(attr => 
      attr.id === id ? { ...attr, [field]: value } : attr
    ));
  };

  const handleMeasurementSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder || !selectedItem) return;

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      // Merge custom attributes directly into measurements object
      const finalMeasurements = { ...measurementData };
      
      // Add custom attributes as individual measurement fields
      customAttributes.forEach(attr => {
        if (attr.name && attr.name.trim()) {
          const key = attr.name.trim();
          finalMeasurements[key] = attr.value;
        }
      });

      const payload = {
        orderId: selectedOrder.orderId,
        orderItemId: selectedItem.orderItemId,
        measurements: finalMeasurements
      };
      
      console.log('📦 Measurement payload:', payload);

      const response = await fetch('/api/measurement-boy/submit-measurement', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit measurements');
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Measurements submitted successfully!');
        setShowMeasurementForm(false);
        setSelectedOrder(null);
        setSelectedItem(null);
        setMeasurementData({});
        // Refresh orders
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting measurements:', error);
      alert('Failed to submit measurements. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="measurement-boy-home-container">
      {/* Header */}
      <header className="measurement-boy-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-logo">
              Fit <span className="logo-highlight">Formal</span>
            </h1>
          </div>
          
          <nav className="header-nav">
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Measurement Orders
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
                onNavigateToProfile();
              }}
            >
              Profile
            </button>
          </nav>

          <div className="header-actions">
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="measurement-boy-main">
        <div className="content-wrapper">
          <div className="page-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="page-title">Measurement Orders</h2>
                <p className="page-subtitle">Take measurements for pending orders</p>
              </div>
              <div className="filter-container">
                <label htmlFor="status-filter" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: '#654321',
                  marginRight: '0.5rem'
                }}>
                  Filter:
                </label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="status-filter-dropdown"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error: {error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h18M3 12h18M3 17h18"/>
              </svg>
              <p>No measurement orders available</p>
            </div>
          ) : getFilteredOrders().length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h18M3 12h18M3 17h18"/>
              </svg>
              <p>No {filterStatus === 'pending' ? 'pending' : 'completed'} orders found</p>
            </div>
          ) : (
            <div className="orders-list">
              {getFilteredOrders().map((order) => (
                <div key={order.orderId} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-id">Order #{order.orderId}</h3>
                      <p className="order-date">
                        {formatDate(order.orderDate)} at {formatTime(order.orderDate)}
                      </p>
                    </div>
                  </div>

                  {/* <div className="customer-info">
                    <h4>Customer Details</h4>
                    {order.deliveryAddresses && order.deliveryAddresses.length > 0 ? (
                      <div className="customer-details">
                        {order.deliveryAddresses
                          .filter(addr => addr.deliveryAddressType === 'Delivery')
                          .map((addr, idx) => (
                            <div key={idx}>
                              <p><strong>Name:</strong> {addr.fullName}</p>
                              <p><strong>Phone:</strong> {addr.phoneNumber}</p>
                              <p><strong>Address:</strong> {addr.addressLine1}, {addr.city}</p>
                            </div>
                          ))}
                        {order.deliveryAddresses.filter(addr => addr.deliveryAddressType === 'Delivery').length === 0 && (
                          <p>Customer information not available</p>
                        )}
                      </div>
                    ) : order.deliveryAddress ? (
                      <div className="customer-details">
                        <p><strong>Name:</strong> {order.deliveryAddress.fullName}</p>
                        <p><strong>Phone:</strong> {order.deliveryAddress.phoneNumber}</p>
                        <p><strong>Address:</strong> {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}</p>
                      </div>
                    ) : (
                      <p>Customer information not available</p>
                    )}
                  </div> */}

                  <div className="measurement-address">
                    <h4>Measurement Address</h4>
                    {order.measurementAddress ? (
                      <div className="address-details">
                        <p><strong>Name:</strong> {order.measurementAddress.fullName}</p>
                        <p><strong>Phone:</strong> {order.measurementAddress.phoneNumber}</p>
                        <p><strong>Address:</strong> {order.measurementAddress.addressLine1}</p>
                        {order.measurementAddress.addressLine2 && (
                          <p>{order.measurementAddress.addressLine2}</p>
                        )}
                        <p>{order.measurementAddress.city}, {order.measurementAddress.state} - {order.measurementAddress.pincode}</p>
                        {order.measurementAddress.landmark && (
                          <p><strong>Landmark:</strong> {order.measurementAddress.landmark}</p>
                        )}
                      </div>
                    ) : order.deliveryAddresses && order.deliveryAddresses.length > 0 ? (
                      <>
                        {order.deliveryAddresses
                          .filter(addr => addr.deliveryAddressType === 'Measurement')
                          .map((addr, idx) => (
                            <div key={idx} className="address-details">
                              <p><strong>Name:</strong> {addr.fullName}</p>
                              <p><strong>Phone:</strong> {addr.phoneNumber}</p>
                              <p><strong>Address:</strong> {addr.addressLine1}</p>
                              {addr.addressLine2 && (
                                <p>{addr.addressLine2}</p>
                              )}
                              <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                              {addr.landmark && (
                                <p><strong>Landmark:</strong> {addr.landmark}</p>
                              )}
                            </div>
                          ))}
                        {order.deliveryAddresses.filter(addr => addr.deliveryAddressType === 'Measurement').length === 0 && (
                          <p>Measurement address not available</p>
                        )}
                      </>
                    ) : (
                      <p>Measurement address not available</p>
                    )}
                    {order.orderItems && order.orderItems.length > 0 && order.orderItems[0].measurementDate && (
                      <div className="measurement-schedule">
                        <p><strong>Measurement Date:</strong> {formatDate(order.orderItems[0].measurementDate)}</p>
                        {order.orderItems[0].measurementSlot && (
                          <p><strong>Time Slot:</strong> {
                            typeof order.orderItems[0].measurementSlot === 'object' 
                              ? (order.orderItems[0].measurementSlot.time || JSON.stringify(order.orderItems[0].measurementSlot))
                              : order.orderItems[0].measurementSlot
                          }</p>
                        )}
                      </div>
                    )}
                    {order.assignmentStatus && (
                      <div className="assignment-info" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e5e5' }}>
                        <p><strong>Assignment Status:</strong> <span className={`status-badge ${order.assignmentStatus?.toLowerCase()}`}>{order.assignmentStatus}</span></p>
                        {order.assignedAt && (
                          <p><strong>Assigned At:</strong> {formatDate(order.assignedAt)}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="order-items">
                    <h4>Items to Measure</h4>
                    <div className="items-list">
                      {order.orderItems && order.orderItems.length > 0 ? (
                        order.orderItems.map((item) => (
                          <div key={item.orderItemId} className="item-card">
                            <div className="item-info">
                              <h5 className="item-type">{item.itemType}</h5>
                              <p className="item-description">{item.description || 'No description'}</p>
                              <p className="item-quantity">Quantity: {item.quantity}</p>
                              {item.measurementDate && (
                                <p className="item-measurement-date">
                                  Measurement Date: {formatDate(item.measurementDate)}
                                </p>
                              )}
                            </div>
                            <div className="item-actions">
                              {isOrderMeasurementDone(order) ? (
                                <div className="measurement-status-done-container">
                                  <span className="measurement-status completed">
                                    ✓ Done
                                  </span>
                                  <button
                                    className="edit-measurement-icon-btn"
                                    onClick={() => handleTakeMeasurement(order, item)}
                                    title="Edit Measurement"
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="measure-btn"
                                  onClick={() => handleTakeMeasurement(order, item)}
                                >
                                  Take Measurement
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No items found</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Measurement Form Modal */}
      {showMeasurementForm && selectedOrder && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowMeasurementForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{hasMeasurements(selectedItem) ? 'Edit' : 'Take'} Measurement - {selectedItem.itemType}</h3>
              <button className="close-btn" onClick={() => setShowMeasurementForm(false)}>×</button>
            </div>
            <form className="measurement-form" onSubmit={handleMeasurementSubmit}>
              <div className="form-group">
                <label>Order Item ID</label>
                <input type="text" value={selectedItem.orderItemId} disabled />
              </div>
              <div className="form-group">
                <label>Item Type</label>
                <input type="text" value={selectedItem.itemType} disabled />
              </div>
              
              <h4>Measurement Details</h4>
              
              {/* Common measurements */}
              <div className="measurement-grid">
                <div className="form-group">
                  <label>Chest (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.chest || ''}
                    onChange={(e) => setMeasurementData({...measurementData, chest: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Waist (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.waist || ''}
                    onChange={(e) => setMeasurementData({...measurementData, waist: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hip (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.hip || ''}
                    onChange={(e) => setMeasurementData({...measurementData, hip: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Shoulder (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.shoulder || ''}
                    onChange={(e) => setMeasurementData({...measurementData, shoulder: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Neck (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.neck || ''}
                    onChange={(e) => setMeasurementData({...measurementData, neck: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Sleeve Length (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.sleeveLength || ''}
                    onChange={(e) => setMeasurementData({...measurementData, sleeveLength: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Shirt Length (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.shirtLength || ''}
                    onChange={(e) => setMeasurementData({...measurementData, shirtLength: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Pant Length (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.pantLength || ''}
                    onChange={(e) => setMeasurementData({...measurementData, pantLength: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Inseam (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.inseam || ''}
                    onChange={(e) => setMeasurementData({...measurementData, inseam: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Thigh (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementData.thigh || ''}
                    onChange={(e) => setMeasurementData({...measurementData, thigh: e.target.value})}
                  />
                </div>
              </div>

              {/* Custom Attributes Section */}
              <div className="custom-attributes-section">
                <div className="section-header">
                  <h4>Custom Measurements</h4>
                  <button 
                    type="button" 
                    className="add-custom-btn"
                    onClick={handleAddCustomAttribute}
                  >
                    + Add Custom Measurement
                  </button>
                </div>
                
                {customAttributes.length > 0 && (
                  <div className="custom-attributes-list">
                    {customAttributes.map((attr) => (
                      <div key={attr.id} className="custom-attribute-row">
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <label>Measurement Name</label>
                          <input
                            type="text"
                            value={attr.name}
                            onChange={(e) => handleCustomAttributeChange(attr.id, 'name', e.target.value)}
                            placeholder="e.g., Armhole, Cuff Width"
                            style={{ marginBottom: 0 }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0, marginLeft: '0.5rem' }}>
                          <label>Value (inches)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={attr.value}
                            onChange={(e) => handleCustomAttributeChange(attr.id, 'value', e.target.value)}
                            placeholder="0.0"
                            style={{ marginBottom: 0 }}
                          />
                        </div>
                        <button
                          type="button"
                          className="remove-attr-btn"
                          onClick={() => handleRemoveCustomAttribute(attr.id)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  rows="3"
                  value={measurementData.notes || ''}
                  onChange={(e) => setMeasurementData({...measurementData, notes: e.target.value})}
                  placeholder="Any additional notes or special instructions..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowMeasurementForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Measurements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementBoyHome;

