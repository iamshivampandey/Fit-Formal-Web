import { useState, useEffect } from 'react';
import './CustomerHome.css';

const CustomerHome = ({ user, onLogout, onNavigateToProfile, onNavigateToTailors, onNavigateToOrderDetails }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [allOrders, setAllOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Fetch customer orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        setIsLoadingOrders(false);
        return;
      }

      setIsLoadingOrders(true);
      setOrdersError(null);

      try {
        // Prepare headers with authorization token
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if token is available
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(`/api/orders/customer/${user.id}`, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Sort orders by orderDate (most recent first)
          const sortedOrders = data.data
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          setAllOrders(sortedOrders);
        } else {
          setAllOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersError(error.message);
        setAllOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Format order date
  const formatOrderDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format order ID
  const formatOrderId = (orderId) => {
    return `#ORD-${orderId}`;
  };

  // Get status class name
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

  // Get status display text
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

  // Get order item description (first item or summary)
  const getOrderItemDescription = (order) => {
    if (order.orderItems && order.orderItems.length > 0) {
      const firstItem = order.orderItems[0];
      if (order.orderItems.length === 1) {
        return firstItem.itemType || firstItem.description || 'Order Item';
      } else {
        return `${firstItem.itemType || firstItem.description || 'Order Item'} + ${order.orderItems.length - 1} more`;
      }
    }
    return order.orderType || 'Order';
  };

  // Get shop/tailor name (from orderItems or notes)
  const getShopName = (order) => {
    // Try to get from orderItems first
    if (order.orderItems && order.orderItems.length > 0) {
      // Could be enhanced to fetch shop/tailor name from their IDs
    }
    // Fallback to a generic name or extract from notes
    return order.orderType === 'Tailoring' ? 'Tailor' : 'Shop';
  };

  // Get orders to display based on active tab
  const displayedOrders = activeTab === 'orders' ? allOrders : allOrders.slice(0, 3);

  return (
    <div className="customer-home-container">
      {/* Header */}
      <header className="customer-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-logo">
              Fit <span className="logo-highlight">Formal</span>
            </h1>
          </div>
          
          <nav className="header-nav">
            <button 
              className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              Browse
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              My Orders
            </button>
            <button 
              className={`nav-item ${activeTab === 'measurements' ? 'active' : ''}`}
              onClick={() => setActiveTab('measurements')}
            >
              Measurements
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
            <button className="cart-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className="cart-badge">3</span>
            </button>
            <button className="notification-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="customer-main">
        <div className="content-wrapper">
          {activeTab === 'orders' ? (
            /* My Orders Tab - Show All Orders */
            <div className="orders-page">
              <div className="section-header">
                <h2 className="section-title">My Orders</h2>
                {allOrders.length > 0 && (
                  <span className="orders-count">{allOrders.length} {allOrders.length === 1 ? 'order' : 'orders'}</span>
                )}
              </div>
              {isLoadingOrders ? (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#8E8E93' 
                }}>
                  Loading orders...
                </div>
              ) : ordersError ? (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#ff3b30' 
                }}>
                  Error loading orders: {ordersError}
                </div>
              ) : allOrders.length === 0 ? (
                <div style={{ 
                  padding: '4rem 2rem', 
                  textAlign: 'center', 
                  color: '#8E8E93' 
                }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>No orders yet</h3>
                  <p style={{ margin: 0 }}>Start browsing to place your first order</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {displayedOrders.map((order) => (
                    <div 
                      key={order.orderId} 
                      className="order-card"
                      onClick={() => {
                        if (onNavigateToOrderDetails) {
                          onNavigateToOrderDetails(order.orderId);
                        }
                      }}
                    >
                      <div className="order-header">
                        <span className="order-id">{formatOrderId(order.orderId)}</span>
                        <span className={`order-status ${getStatusClass(order.paymentStatus || order.orderItems?.[0]?.status)}`}>
                          {getStatusText(order.paymentStatus || order.orderItems?.[0]?.status)}
                        </span>
                      </div>
                      <div className="order-details">
                        <h4 className="order-item">{getOrderItemDescription(order)}</h4>
                        <p className="order-shop">{getShopName(order)}</p>
                        <div className="order-footer">
                          <span className="order-date">{formatOrderDate(order.orderDate)}</span>
                          <span className="order-price">₹{order.totalAmount?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'measurements' ? (
            /* Measurements Tab */
            <div className="measurements-page">
              <div className="section-header">
                <h2 className="section-title">My Measurements</h2>
              </div>
              <div style={{ 
                padding: '4rem 2rem', 
                textAlign: 'center', 
                color: '#8E8E93' 
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>No measurements yet</h3>
                <p style={{ margin: 0 }}>Your saved measurements will appear here</p>
              </div>
            </div>
          ) : (
            /* Browse Tab - Default Home View */
            <>
              {/* Hero Section */}
              <div className="hero-section">
                <div className="hero-content">
                  <h1 className="hero-title">
                    Welcome, <span className="user-name">{user?.firstName || 'Customer'}</span>! 👔
                  </h1>
                  <p className="hero-subtitle">
                    Discover premium formal fabrics and get custom-tailored clothing delivered to your doorstep
                  </p>
                  <button className="cta-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Browse Fabrics
                  </button>
                </div>
                <div className="hero-image">
                  <div className="hero-placeholder">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="services-section">
                <h2 className="section-title">Our Services</h2>
                <div className="services-grid">
                  <div className="service-card">
                    <div className="service-icon" style={{ background: 'linear-gradient(135deg, #654321 0%, #8B5E3C 100%)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <h3 className="service-title">Browse Fabrics</h3>
                    <p className="service-description">
                      Explore our wide collection of premium formal fabrics from verified shops
                    </p>
                    <button className="service-btn">Explore Now</button>
                  </div>

                  <div className="service-card">
                    <div className="service-icon" style={{ background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                    </div>
                    <h3 className="service-title">Book Tailor</h3>
                    <p className="service-description">
                      Book professional tailors for home measurements and stitching services
                    </p>
                    <button className="service-btn" onClick={onNavigateToTailors}>Book Now</button>
                  </div>

                  <div className="service-card">
                    <div className="service-icon" style={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </div>
                    <h3 className="service-title">Complete Package</h3>
                    <p className="service-description">
                      Get fabric, measurement, and stitching - all in one complete solution
                    </p>
                    <button className="service-btn">View Packages</button>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="recent-orders-section">
                <div className="section-header">
                  <h2 className="section-title">Recent Orders</h2>
                </div>
                {isLoadingOrders ? (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: '#8E8E93' 
                  }}>
                    Loading orders...
                  </div>
                ) : ordersError ? (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: '#ff3b30' 
                  }}>
                    Error loading orders: {ordersError}
                  </div>
                ) : allOrders.length === 0 ? (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: '#8E8E93' 
                  }}>
                    No orders found
                  </div>
                ) : (
                  <div className="orders-grid">
                    {displayedOrders.map((order) => (
                      <div 
                        key={order.orderId} 
                        className="order-card"
                        onClick={() => {
                          if (onNavigateToOrderDetails) {
                            onNavigateToOrderDetails(order.orderId);
                          }
                        }}
                      >
                        <div className="order-header">
                          <span className="order-id">{formatOrderId(order.orderId)}</span>
                          <span className={`order-status ${getStatusClass(order.paymentStatus || order.orderItems?.[0]?.status)}`}>
                            {getStatusText(order.paymentStatus || order.orderItems?.[0]?.status)}
                          </span>
                        </div>
                        <div className="order-details">
                          <h4 className="order-item">{getOrderItemDescription(order)}</h4>
                          <p className="order-shop">{getShopName(order)}</p>
                          <div className="order-footer">
                            <span className="order-date">{formatOrderDate(order.orderDate)}</span>
                            <span className="order-price">₹{order.totalAmount?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Shops */}
              <div className="featured-section">
                <h2 className="section-title">Featured Shops & Tailors</h2>
                <div className="featured-grid">
                  <div className="featured-card">
                    <div className="featured-image">
                      <div className="featured-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="featured-info">
                      <h4 className="featured-name">Royal Fabrics</h4>
                      <p className="featured-desc">Premium formal fabrics</p>
                      <div className="featured-meta">
                        <span className="rating">⭐ 4.8</span>
                        <span className="reviews">(245 reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="featured-card">
                    <div className="featured-image">
                      <div className="featured-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="featured-info">
                      <h4 className="featured-name">Elite Tailors</h4>
                      <p className="featured-desc">Expert stitching services</p>
                      <div className="featured-meta">
                        <span className="rating">⭐ 4.9</span>
                        <span className="reviews">(189 reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="featured-card">
                    <div className="featured-image">
                      <div className="featured-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                      </div>
                    </div>
                    <div className="featured-info">
                      <h4 className="featured-name">Complete Solutions</h4>
                      <p className="featured-desc">End-to-end formal wear</p>
                      <div className="featured-meta">
                        <span className="rating">⭐ 4.7</span>
                        <span className="reviews">(156 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerHome;

