import { useState } from 'react';
import './Profile.css';

const Profile = ({ user, onLogout, onBack }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });
console.log(user);
  // For measurement data (customer specific)
  const [measurements, setMeasurements] = useState({
    chest: '38',
    waist: '32',
    shoulder: '16',
    sleeveLength: '24',
    shirtLength: '28',
    neck: '15',
    hip: '36',
    inseam: '30',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    // Add API call here to save profile data
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
    });
    setIsEditing(false);
  };

  // Determine user role - roleId 2 = Customer, others (3,4,5) = Seller/Tailor
  const isCustomer = user?.roleId === 2 || user?.roleName?.toLowerCase().includes('customer');
  const isSeller = (user?.roleId === 3 || user?.roleId === 4 || user?.roleId === 5) ||
                   user?.roleName?.toLowerCase().includes('seller') || 
                   user?.roleName?.toLowerCase().includes('shop') ||
                   user?.roleName?.toLowerCase().includes('tailor');
  
  // Ensure customer NEVER sees business info - explicit check
  const showBusinessInfo = isSeller && !isCustomer;
  
  console.log('👤 Profile - User Role:', {
    roleId: user?.roleId,
    roleName: user?.roleName,
    isCustomer,
    isSeller,
    showBusinessInfo
  });

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <div className="logo-section">
            <h1 className="app-logo">
              Fit <span className="logo-highlight">Formal</span>
            </h1>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="profile-wrapper">
          {/* Profile Header Section */}
          <div className="profile-hero">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <button className="avatar-upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            <div className="profile-hero-info">
              <h2 className="profile-name">{user?.firstName} {user?.lastName}</h2>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badge">
                {user?.roleName || 'User'}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeSection === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveSection('personal')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Personal Info
            </button>
            {isCustomer && (
              <button
                className={`tab-btn ${activeSection === 'measurements' ? 'active' : ''}`}
                onClick={() => setActiveSection('measurements')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                Measurements
              </button>
            )}
            {showBusinessInfo && (
              <button
                className={`tab-btn ${activeSection === 'business' ? 'active' : ''}`}
                onClick={() => setActiveSection('business')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Business Info
              </button>
            )}
            <button
              className={`tab-btn ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Security
            </button>
            <button
              className={`tab-btn ${activeSection === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveSection('preferences')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"/>
              </svg>
              Preferences
            </button>
          </div>

          {/* Content Sections */}
          <div className="profile-content">
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Personal Information</h3>
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                      </button>
                      <button className="save-btn" onClick={handleSave}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter email"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pin Code</label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-input"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter pin code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Measurements Section (Customer only) */}
            {activeSection === 'measurements' && isCustomer && (
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Body Measurements</h3>
                  <button className="edit-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                </div>
                
                <div className="measurements-info">
                  <div className="info-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <p>All measurements are in inches. For accurate measurements, please consult with a professional tailor.</p>
                  </div>
                </div>

                <div className="measurements-grid">
                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Chest</h4>
                    <input
                      type="text"
                      name="chest"
                      className="measurement-input"
                      value={measurements.chest}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 38"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>

                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Waist</h4>
                    <input
                      type="text"
                      name="waist"
                      className="measurement-input"
                      value={measurements.waist}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 32"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>

                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Shoulder</h4>
                    <input
                      type="text"
                      name="shoulder"
                      className="measurement-input"
                      value={measurements.shoulder}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 16"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>

                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14"/>
                        <line x1="4" y1="10" x2="4" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12" y2="3"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Sleeve Length</h4>
                    <input
                      type="text"
                      name="sleeveLength"
                      className="measurement-input"
                      value={measurements.sleeveLength}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 24"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>

                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Shirt Length</h4>
                    <input
                      type="text"
                      name="shirtLength"
                      className="measurement-input"
                      value={measurements.shirtLength}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 28"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>

                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Neck</h4>
                    <input
                      type="text"
                      name="neck"
                      className="measurement-input"
                      value={measurements.neck}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 15"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>

                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Hip</h4>
                    <input
                      type="text"
                      name="hip"
                      className="measurement-input"
                      value={measurements.hip}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 36"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>

                  <div className="measurement-card">
                    <div className="measurement-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="2" x2="12" y2="22"/>
                        <line x1="17" y1="7" x2="7" y2="7"/>
                        <line x1="17" y1="17" x2="7" y2="17"/>
                      </svg>
                    </div>
                    <h4 className="measurement-label">Inseam</h4>
                    <input
                      type="text"
                      name="inseam"
                      className="measurement-input"
                      value={measurements.inseam}
                      onChange={handleMeasurementChange}
                      placeholder="e.g., 30"
                    />
                    <span className="measurement-unit">inches</span>
                  </div>
                </div>

                <button className="save-measurements-btn">
                  Save Measurements
                </button>
              </div>
            )}

            {/* Business Information Section (Seller only) */}
            {activeSection === 'business' && showBusinessInfo && (
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Business Information</h3>
                  <button className="edit-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Business Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter business name"
                      defaultValue="Elite Tailors & Fabrics"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Type</label>
                    <select className="form-input">
                      <option>Fabric Shop</option>
                      <option>Tailor</option>
                      <option>Both</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">GST Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter GST number"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Shop Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter shop address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Hours</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 9 AM - 9 PM"
                      defaultValue="9:00 AM - 9:00 PM"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      rows="4"
                      placeholder="Tell customers about your business"
                      defaultValue="We provide premium quality fabrics and expert tailoring services for all your formal wear needs."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Security Settings</h3>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <div className="security-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="security-title">Change Password</h4>
                      <p className="security-desc">Update your password regularly to keep your account secure</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <button className="update-password-btn">
                    Update Password
                  </button>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <div className="security-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="security-title">Two-Factor Authentication</h4>
                      <p className="security-desc">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <button className="enable-2fa-btn">
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Preferences</h3>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4 className="preference-title">Email Notifications</h4>
                    <p className="preference-desc">Receive email updates about orders and promotions</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4 className="preference-title">SMS Notifications</h4>
                    <p className="preference-desc">Get order updates via SMS</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4 className="preference-title">Marketing Communications</h4>
                    <p className="preference-desc">Receive promotional offers and news</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4 className="preference-title">Order Status Updates</h4>
                    <p className="preference-desc">Get real-time updates on your orders</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-divider"></div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-input">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                    <option>Tamil</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-input">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

