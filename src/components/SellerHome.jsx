import { useState } from 'react';
import './SellerHome.css';

// ============================================
// CONSTANTS & DATA
// ============================================

/**
 * Dashboard statistics data
 */
const STATS_DATA = [
  {
    id: 'totalOrders',
    value: '24',
    label: 'Total Orders',
    iconColor: 'linear-gradient(135deg, #654321 0%, #8B5E3C 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    )
  },
  {
    id: 'completed',
    value: '18',
    label: 'Completed',
    iconColor: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )
  },
  {
    id: 'pending',
    value: '4',
    label: 'Pending',
    iconColor: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    )
  },
  {
    id: 'totalRevenue',
    value: '₹45,280',
    label: 'Total Revenue',
    iconColor: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )
  }
];

/**
 * Recent activity data
 */
const ACTIVITIES_DATA = [
  {
    id: 'activity-1',
    title: 'Order #1234 Completed',
    time: '2 hours ago',
    amount: '₹2,500',
    status: 'completed'
  },
  {
    id: 'activity-2',
    title: 'New Order #1235 Received',
    time: '5 hours ago',
    amount: '₹3,200',
    status: 'pending'
  },
  {
    id: 'activity-3',
    title: 'Payment Received - Order #1230',
    time: '1 day ago',
    amount: '₹1,800',
    status: 'completed'
  },
  {
    id: 'activity-4',
    title: 'Order #1228 Delivered',
    time: '2 days ago',
    amount: '₹4,500',
    status: 'completed'
  }
];

/**
 * Quick actions data
 */
const QUICK_ACTIONS_DATA = [
  {
    id: 'newOrder',
    title: 'New Order',
    description: 'Create a new order',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    onClick: () => console.log('New Order clicked')
  },
  {
    id: 'manageProducts',
    title: 'Add/Manage Products',
    description: 'Add or edit your products',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
        <line x1="18" y1="2" x2="18" y2="10"/>
        <line x1="14" y1="6" x2="22" y2="6"/>
        <path d="M12 11v6"/>
        <path d="M9 14h6"/>
      </svg>
    ),
    onClick: () => console.log('Add/Manage Products clicked')
  },
  {
    id: 'viewInventory',
    title: 'View Inventory',
    description: 'Manage your products',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    onClick: () => console.log('View Inventory clicked')
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'View customer list',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    onClick: () => console.log('Customers clicked')
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'View sales reports',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    onClick: () => console.log('Reports clicked')
  }
];

/**
 * Navigation items for header
 */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Orders' },
  { id: 'profile', label: 'Profile' }
];

// ============================================
// REUSABLE COMPONENTS
// ============================================

/**
 * StatCard - Reusable component for displaying statistics
 */
const StatCard = ({ value, label, iconColor, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconColor }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
};

/**
 * ActivityItem - Reusable component for displaying activity items
 */
const ActivityItem = ({ title, time, amount, status }) => {
  const isCompleted = status === 'completed';
  const checkIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  const clockIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  return (
    <div className="activity-item">
      <div className={`activity-icon ${status}`}>
        {isCompleted ? checkIcon : clockIcon}
      </div>
      <div className="activity-details">
        <h4 className="activity-title">{title}</h4>
        <p className="activity-time">{time}</p>
      </div>
      <span className="activity-amount">{amount}</span>
    </div>
  );
};

/**
 * ActionCard - Reusable component for quick action buttons
 */
const ActionCard = ({ title, description, icon, onClick }) => {
  return (
    <button className="action-card" onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <h4 className="action-title">{title}</h4>
      <p className="action-desc">{description}</p>
    </button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const SellerHome = ({ user, onLogout, onNavigateToProducts, onNavigateToProfile, onNavigateToOrdersPerDay }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  /**
   * Check if user is a Tailor
   */
  const isTailor = () => {
    if (user?.roleId === 4) return true;
    if (user?.roleName === 'Tailor') return true;
    if (user?.roles && user.roles.length > 0) {
      return user.roles.some(role => role.id === 4 || role.name === 'Tailor');
    }
    return false;
  };

  /**
   * Handler for navigation tab clicks
   */
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    // Add navigation logic here when implementing routing
    console.log(`Navigating to ${tabId}`);
    
    // Navigate to profile if profile tab is clicked
    if (tabId === 'profile' && onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  /**
   * Create actions with navigation handlers and role-based filtering
   */
  const getActionsForUser = () => {
    const tailorUser = isTailor();
    
    // Filter actions based on user role
    let filteredActions = QUICK_ACTIONS_DATA.filter(action => {
      // Remove "Add/Manage Products" for Tailors
      if (tailorUser && action.id === 'manageProducts') {
        return false;
      }
      return true;
    });

    // Add "OrdersPerDay" for Tailors in place of "Add/Manage Products"
    if (tailorUser) {
      const ordersPerDayAction = {
        id: 'ordersPerDay',
        title: 'Orders Per Day',
        description: 'View orders per day',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
          </svg>
        ),
        onClick: () => {
          if (onNavigateToOrdersPerDay) {
            onNavigateToOrdersPerDay();
          }
        }
      };
      
      // Insert OrdersPerDay at the same position where manageProducts was (index 1)
      filteredActions.splice(1, 0, ordersPerDayAction);
    }

    // Add navigation handlers
    return filteredActions.map(action => {
      if (action.id === 'manageProducts' && onNavigateToProducts) {
        return {
          ...action,
          onClick: () => {
            console.log('Add/Manage Products clicked - navigating to products page');
            onNavigateToProducts();
          }
        };
      }
      return action;
    });
  };

  const actionsWithHandlers = getActionsForUser();

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo-section">
            <h1 className="app-logo">
              Fit <span className="logo-highlight">Formal</span>
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="header-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            <button className="notification-btn" aria-label="Notifications">
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
      <main className="home-main">
        <div className="content-wrapper">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h2 className="welcome-title">
              Welcome back, <span className="user-name">{user?.firstName || 'User'}</span>! 👋
            </h2>
            <p className="welcome-subtitle">
              Here's what's happening with your account today
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {STATS_DATA.map((stat) => (
              <StatCard
                key={stat.id}
                value={stat.value}
                label={stat.label}
                iconColor={stat.iconColor}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h3 className="section-title">Recent Activity</h3>
            <div className="activity-list">
              {ACTIVITIES_DATA.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  title={activity.title}
                  time={activity.time}
                  amount={activity.amount}
                  status={activity.status}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              {actionsWithHandlers.map((action) => (
                <ActionCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  onClick={action.onClick}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerHome;
