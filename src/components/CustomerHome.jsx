import { useState } from 'react';
import './CustomerHome.css';

const CustomerHome = ({ user, onLogout, onNavigateToProfile, onNavigateToTailors }) => {
  const [activeTab, setActiveTab] = useState('browse');

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
              <button className="view-all-btn">View All</button>
            </div>
            <div className="orders-grid">
              <div className="order-card">
                <div className="order-header">
                  <span className="order-id">#ORD-1234</span>
                  <span className="order-status status-delivered">Delivered</span>
                </div>
                <div className="order-details">
                  <h4 className="order-item">Premium Black Suit Fabric</h4>
                  <p className="order-shop">Royal Fabrics</p>
                  <div className="order-footer">
                    <span className="order-date">Dec 10, 2024</span>
                    <span className="order-price">₹2,500</span>
                  </div>
                </div>
              </div>

              <div className="order-card">
                <div className="order-header">
                  <span className="order-id">#ORD-1235</span>
                  <span className="order-status status-in-progress">In Progress</span>
                </div>
                <div className="order-details">
                  <h4 className="order-item">Navy Blue Blazer + Stitching</h4>
                  <p className="order-shop">Elite Tailors</p>
                  <div className="order-footer">
                    <span className="order-date">Dec 12, 2024</span>
                    <span className="order-price">₹4,800</span>
                  </div>
                </div>
              </div>

              <div className="order-card">
                <div className="order-header">
                  <span className="order-id">#ORD-1236</span>
                  <span className="order-status status-pending">Pending</span>
                </div>
                <div className="order-details">
                  <h4 className="order-item">Gray Formal Trouser Fabric</h4>
                  <p className="order-shop">Premium Cloth House</p>
                  <div className="order-footer">
                    <span className="order-date">Dec 14, 2024</span>
                    <span className="order-price">₹1,800</span>
                  </div>
                </div>
              </div>
            </div>
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
        </div>
      </main>
    </div>
  );
};

export default CustomerHome;

