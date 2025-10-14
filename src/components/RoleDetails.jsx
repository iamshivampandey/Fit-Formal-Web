import './RoleDetails.css';

const RoleDetails = ({ role, onContinue, onBack }) => {
  const roleData = {
    shop: {
      title: 'Shop',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Sell formal fabrics to customers',
      benefits: [
        'List your fabric inventory online',
        'Reach customers across the city',
        'Manage orders efficiently',
        'Track sales and inventory',
        'Grow your fabric business'
      ],
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    tailor: {
      title: 'Tailor',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Provide measurement and stitching services',
      benefits: [
        'Visit customer homes for measurements',
        'Receive stitching orders from customers',
        'Flexible work schedule',
        'Earn from your tailoring skills',
        'Build your customer base'
      ],
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    tailor_shop: {
      title: 'Tailor + Shop',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="21" r="1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="20" cy="21" r="1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Complete end-to-end formal wear service',
      benefits: [
        'Bring fabric samples to customers',
        'Take measurements at home',
        'Deliver finished clothing',
        'Offer complete formal wear solutions',
        'Higher earning potential'
      ],
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  };

  const currentRole = roleData[role];

  return (
    <div className="role-details-container">
      <div className="role-details-content">
        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className="progress-step completed">✓</div>
          <div className="progress-line"></div>
          <div className="progress-step current">2</div>
        </div>

        {/* Build Customer Base Banner */}
        <div className="info-banner">
          <span className="checkmark">✓</span>
          <span>Build your customer base</span>
        </div>

        {/* Role Card */}
        <div className="details-card">
          <div className="role-header">
            <div className="role-icon-large" style={{ background: currentRole.gradient }}>
              {currentRole.icon}
            </div>
            <div>
              <h2 className="role-title-large">{currentRole.title}</h2>
              <p className="role-desc">{currentRole.description}</p>
            </div>
          </div>

          <div className="benefits-section">
            <h3>What you get:</h3>
            <ul className="benefits-list">
              {currentRole.benefits.map((benefit, index) => (
                <li key={index}>
                  <span className="check-icon">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* About Ecosystem */}
        <div className="ecosystem-card">
          <h3 className="ecosystem-title">About Our Ecosystem</h3>
          <p className="ecosystem-text">
            Fit Formal connects customers with tailors and fabric shops to create a complete formal wear solution. 
            Whether you're buying fabric, getting measurements, or providing services - we've got you covered.
          </p>
        </div>

        {/* Action Buttons */}
        <button className="continue-signup-button" onClick={onContinue}>
          Continue to Sign Up
        </button>

        <button className="back-button" onClick={onBack}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default RoleDetails;

