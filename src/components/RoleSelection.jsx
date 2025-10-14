import { useState } from 'react';
import './RoleSelection.css';

const RoleSelection = ({ onRoleSelect, onBackToLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole && onRoleSelect) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <h1 className="role-title">Choose Your <span className="role-highlight">Role</span></h1>
        <p className="role-subtitle">
          Select how you'd like to use Fit Formal's formal wear ecosystem
        </p>

        <div className="role-cards-container">
          {/* Customer Card */}
          <div 
            className={`role-card ${selectedRole === 'Customer' ? 'selected' : ''}`}
            onClick={() => handleRoleClick('Customer')}
          >
            <div className="role-icon customer-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="role-info">
              <h2 className="role-name">Customer</h2>
              <p className="role-description">Buy formal fabric and get custom clothing</p>
            </div>
            
            <div className="role-benefits">
              <h3>What you get:</h3>
              <ul>
                <li>✓ Browse and purchase formal fabrics online</li>
                <li>✓ Book home measurement service</li>
                <li>✓ Choose from tailor + shop packages</li>
                <li>✓ Track your orders and deliveries</li>
                <li>✓ Get premium formal wear at best prices</li>
              </ul>
            </div>
          </div>

          {/* Seller Card */}
          <div 
            className={`role-card ${selectedRole === 'seller' ? 'selected' : ''}`}
            onClick={() => handleRoleClick('seller')}
          >
            <div className="role-icon seller-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="role-info">
              <h2 className="role-name">Seller</h2>
              <p className="role-description">Sell fabrics and provide tailoring services</p>
            </div>
            
            <div className="role-benefits">
              <h3>What you get:</h3>
              <ul>
                <li>✓ List your fabric inventory online</li>
                <li>✓ Provide measurement and stitching services</li>
                <li>✓ Reach customers across the city</li>
                <li>✓ Manage orders efficiently</li>
                <li>✓ Grow your business</li>
              </ul>
            </div>
          </div>
        </div>

        {/* About Our Ecosystem - Non-selectable info card */}
        <div className="role-card info-card">
          <h2 className="ecosystem-title">About Our Ecosystem</h2>
          <p className="ecosystem-description">
            Fit Formal connects customers with tailors and fabric shops to create a complete formal wear solution. 
            Whether you're buying fabric, getting measurements, or providing services - we've got you covered.
          </p>
        </div>

        <div className="button-container">
          <button 
            className="continue-button" 
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            Continue to Sign Up
          </button>
        </div>

        <button 
          className="back-link" 
          onClick={onBackToLogin}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;

