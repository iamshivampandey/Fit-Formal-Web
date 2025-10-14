import { useState } from 'react';
import './RoleSelection.css';

const SellerTypeSelection = ({ onSellerTypeSelect, onBack }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleTypeClick = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType && onSellerTypeSelect) {
      onSellerTypeSelect(selectedType);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <h1 className="role-title">Choose Your Seller <span className="role-highlight">Type</span></h1>
        <p className="role-subtitle">
          Select the type of seller services you want to provide
        </p>

        <div className="role-cards-container">
          <div 
            className={'role-card' + (selectedType === 'Seller' ? ' selected' : '')}
            onClick={() => handleTypeClick('Seller')}
          >
            <div className="role-icon shop-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="role-info">
              <h2 className="role-name">Shop</h2>
              <p className="role-description">Sell formal fabrics to customers</p>
            </div>
            
            <div className="role-benefits">
              <h3>What you get:</h3>
              <ul>
                <li>List your fabric inventory online</li>
                <li>Reach customers across the city</li>
                <li>Manage orders efficiently</li>
                <li>Track sales and inventory</li>
                <li>Grow your fabric business</li>
              </ul>
            </div>
          </div>

          <div 
            className={'role-card' + (selectedType === 'Tailor' ? ' selected' : '')}
            onClick={() => handleTypeClick('Tailor')}
          >
            <div className="role-icon tailor-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="role-info">
              <h2 className="role-name">Tailor</h2>
              <p className="role-description">Provide measurement and stitching services</p>
            </div>
            
            <div className="role-benefits">
              <h3>What you get:</h3>
              <ul>
                <li>Visit customer homes for measurements</li>
                <li>Receive stitching orders from customers</li>
                <li>Flexible work schedule</li>
                <li>Earn from your tailoring skills</li>
                <li>Build your customer base</li>
              </ul>
            </div>
          </div>

          <div 
            className={'role-card' + (selectedType === 'Taylorseller' ? ' selected' : '')}
            onClick={() => handleTypeClick('Taylorseller')}
          >
            <div className="role-icon shop-tailor-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="21" r="1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="21" r="1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="role-info">
              <h2 className="role-name">Shop + Tailor</h2>
              <p className="role-description">Complete end-to-end formal wear service</p>
            </div>
            
            <div className="role-benefits">
              <h3>What you get:</h3>
              <ul>
                <li>Bring fabric samples to customers</li>
                <li>Take measurements at home</li>
                <li>Deliver finished clothing</li>
                <li>Offer complete formal wear solutions</li>
                <li>Higher earning potential</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="role-card info-card">
          <h2 className="ecosystem-title">About Our Ecosystem</h2>
          <p className="ecosystem-description">
            Fit Formal connects customers with tailors and fabric shops to create a complete formal wear solution. 
            Whether you are buying fabric, getting measurements, or providing services - we have got you covered.
          </p>
        </div>

        <div className="button-container">
          <button 
            className="continue-button" 
            onClick={handleContinue}
            disabled={!selectedType}
          >
            Continue to Sign Up
          </button>
        </div>

        <button 
          className="back-link" 
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default SellerTypeSelection;

