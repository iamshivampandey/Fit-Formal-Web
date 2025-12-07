import { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ user, onLogout, onBack, onShowToast }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);
  const [businessError, setBusinessError] = useState('');
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [newLogoPreview, setNewLogoPreview] = useState('');
  const [isSubmittingBusiness, setIsSubmittingBusiness] = useState(false);
  
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
  
  // For business data (seller specific)
  const [businessData, setBusinessData] = useState({
    businessId: '',
    userId: '',
    businessName: '',
    ownerName: '',
    businessLogo: '',
    businessDescription: '',
    mobileNumber: '',
    alternateNumber: '',
    email: '',
    shopAddress: '',
    googleMapLink: '',
    gpsLatitude: '',
    gpsLongitude: '',
    workingCity: '',
    serviceTypes: '',
    tailoringCategories: '',
    specialization: '',
    yearsOfExperience: '',
    portfolioPhotos: '',
    certifications: '',
    openingTime: '',
    closingTime: '',
    weeklyOff: ''
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
  
  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        if (onShowToast) {
          onShowToast('Please upload a valid image file (JPG, PNG, GIF, or WebP)', 'error');
        }
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        if (onShowToast) {
          onShowToast('Image size should be less than 5MB', 'error');
        }
        return;
      }
      
      // Store the file
      setNewLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogoPreview(reader.result);
        // Update business data with new logo
        setBusinessData(prev => ({
          ...prev,
          businessLogo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveNewLogo = () => {
    setNewLogoFile(null);
    setNewLogoPreview('');
    // Reset to original logo or empty
    const fileInput = document.querySelector('input[name="businessLogoFile"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    // Add API call here to save profile data
    setIsEditing(false);
    if (onShowToast) {
      onShowToast('Profile updated successfully!', 'success');
    }
  };
  
  const handleBusinessSave = async () => {
    console.log('Saving business data:', businessData);
    
    // Prevent duplicate submissions
    if (isSubmittingBusiness) {
      console.log('⚠️ Business update already in progress, ignoring duplicate request');
      return;
    }
    
    if (!businessData.businessId) {
      if (onShowToast) {
        onShowToast('Business ID not found. Cannot update.', 'error');
      }
      return;
    }
    
    setIsSubmittingBusiness(true);
    
    try {
      // Convert time format from HH:MM to ISO timestamp if needed
      const prepareTimeForAPI = (timeString) => {
        if (!timeString) return null;
        try {
          // Create a date with the time (using today's date)
          const [hours, minutes] = timeString.split(':');
          const date = new Date();
          date.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);
          return date.toISOString();
        } catch (e) {
          console.warn('Failed to format time:', e);
          return timeString;
        }
      };
      
      // Convert comma-separated strings to JSON arrays for serviceTypes and tailoringCategories
      const convertToJsonArray = (value) => {
        if (!value) return JSON.stringify([]);
        if (typeof value === 'string') {
          // If it's already a JSON string, return as is
          try {
            JSON.parse(value);
            return value;
          } catch (e) {
            // If it's a comma-separated string, convert to JSON array
            const items = value.split(',').map(item => item.trim()).filter(item => item);
            return JSON.stringify(items);
          }
        }
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return JSON.stringify([]);
      };
      
      const updatePayload = {
        userId: businessData.userId || user.id,
        businessName: businessData.businessName,
        ownerName: businessData.ownerName,
        businessLogo: businessData.businessLogo,
        businessDescription: businessData.businessDescription,
        mobileNumber: businessData.mobileNumber,
        alternateNumber: businessData.alternateNumber,
        email: businessData.email,
        shopAddress: businessData.shopAddress,
        googleMapLink: businessData.googleMapLink,
        gpsLatitude: businessData.gpsLatitude,
        gpsLongitude: businessData.gpsLongitude,
        workingCity: businessData.workingCity,
        serviceTypes: convertToJsonArray(businessData.serviceTypes),
        tailoringCategories: convertToJsonArray(businessData.tailoringCategories),
        specialization: businessData.specialization,
        yearsOfExperience: businessData.yearsOfExperience,
        portfolioPhotos: businessData.portfolioPhotos,
        certifications: businessData.certifications,
        openingTime: prepareTimeForAPI(businessData.openingTime),
        closingTime: prepareTimeForAPI(businessData.closingTime),
        weeklyOff: businessData.weeklyOff
      };
      
      console.log('🔄 Updating business with ID:', businessData.businessId);
      console.log('📦 Update payload:', updatePayload);
      
      const response = await fetch(`/api/business/${businessData.businessId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      
      const data = await response.json();
      console.log('📡 Update response:', data);
      
      if (response.ok && data.success) {
        setIsEditingBusiness(false);
        if (onShowToast) {
          onShowToast('Business information updated successfully!', 'success');
        }
      } else {
        if (onShowToast) {
          onShowToast(data.message || 'Failed to update business information', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error updating business data:', error);
      if (onShowToast) {
        onShowToast('Failed to update business information. Please try again.', 'error');
      }
    } finally {
      setIsSubmittingBusiness(false);
    }
  };
  
  const handleBusinessCancel = () => {
    setIsEditingBusiness(false);
    // Reset any new logo preview
    setNewLogoFile(null);
    setNewLogoPreview('');
    // Reset file input
    const fileInput = document.querySelector('input[name="businessLogoFile"]');
    if (fileInput) {
      fileInput.value = '';
    }
    // Optionally reload the data to reset any changes
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

  // Fetch business data when business section is active
  useEffect(() => {
    const fetchBusinessData = async () => {
      // Only fetch if user is seller and business section is active
      if (!showBusinessInfo || activeSection !== 'business' || !user?.id) {
        return;
      }
      
      setIsLoadingBusiness(true);
      setBusinessError('');
      
      try {
        console.log('🔄 Fetching business data for userId:', user.id);
        const response = await fetch(`/api/business/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log('📡 Business API response:', data);
        
        if (response.ok && data.success && data.data) {
          // Helper function to decode HTML entities and parse JSON
          const parseJsonString = (jsonString) => {
            if (!jsonString) return [];
            if (Array.isArray(jsonString)) return jsonString;
            if (typeof jsonString !== 'string') return [];
            
            try {
              // Decode HTML entities first
              const decoded = jsonString
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
              
              // Parse the JSON
              const parsed = JSON.parse(decoded);
              return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              console.warn('Failed to parse JSON string:', e);
              return [];
            }
          };
          
          // Parse serviceTypes if it's a JSON string
          let serviceTypes = parseJsonString(data.data.serviceTypes);
          
          // Parse tailoringCategories if it's a JSON string
          let tailoringCategories = parseJsonString(data.data.tailoringCategories);
          
          // Parse portfolioPhotos if it's a JSON string
          let portfolioPhotos = data.data.portfolioPhotos;
          if (typeof portfolioPhotos === 'string') {
            try {
              portfolioPhotos = JSON.parse(portfolioPhotos);
            } catch (e) {
              console.warn('Failed to parse portfolioPhotos:', e);
            }
          }
          
          // Parse time from ISO format to HH:MM format for time inputs
          const formatTime = (timeString) => {
            if (!timeString) return '';
            try {
              const date = new Date(timeString);
              const hours = date.getUTCHours().toString().padStart(2, '0');
              const minutes = date.getUTCMinutes().toString().padStart(2, '0');
              return `${hours}:${minutes}`;
            } catch (e) {
              console.warn('Failed to parse time:', e);
              return '';
            }
          };
          
          // Update business data with fetched values - using exact column names from database
          setBusinessData({
            businessId: data.data.businessId || '',
            userId: data.data.userId || '',
            businessName: data.data.BusinessName || data.data.businessName || '',
            ownerName: data.data.ownerName || '',
            businessLogo: data.data.businessLogo || '',
            businessDescription: data.data.businessDescription || '',
            mobileNumber: data.data.mobileNumber || '',
            alternateNumber: data.data.alternateNumber || '',
            email: data.data.Email || data.data.email || '',
            shopAddress: data.data.shopAddress || '',
            googleMapLink: data.data.googleMapLink || '',
            gpsLatitude: data.data.gpsLatitude || '',
            gpsLongitude: data.data.gpsLongitude || '',
            workingCity: data.data.workingCity || '',
            serviceTypes: Array.isArray(serviceTypes) ? serviceTypes.map(s => String(s).trim()).filter(s => s).join(', ') : (serviceTypes || ''),
            tailoringCategories: Array.isArray(tailoringCategories) ? tailoringCategories.map(c => String(c).trim()).filter(c => c).join(', ') : (tailoringCategories || ''),
            specialization: data.data.specialization || '',
            yearsOfExperience: data.data.yearsOfExperience || '',
            portfolioPhotos: Array.isArray(portfolioPhotos) ? portfolioPhotos.join(', ') : (portfolioPhotos || ''),
            certifications: data.data.certifications || '',
            openingTime: formatTime(data.data.openingTime),
            closingTime: formatTime(data.data.closingTime),
            weeklyOff: data.data.weeklyOff || ''
          });
          console.log('✅ Business data loaded successfully');
          console.log('📊 Loaded business data:', {
            businessId: data.data.businessId,
            businessName: data.data.BusinessName || data.data.businessName,
            workingCity: data.data.workingCity
          });
        } else if (response.status === 404) {
          // No business info found - this is okay for new sellers
          console.log('ℹ️ No business information found for this user');
          setBusinessError('No business information found. Please contact support to add your business details.');
        } else {
          throw new Error(data.message || 'Failed to fetch business data');
        }
      } catch (error) {
        console.error('❌ Error fetching business data:', error);
        setBusinessError('Failed to load business information. Please try again later.');
      } finally {
        setIsLoadingBusiness(false);
      }
    };
    
    fetchBusinessData();
  }, [activeSection, user, showBusinessInfo]);

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
                  {!isEditingBusiness ? (
                    <button className="edit-btn" onClick={() => setIsEditingBusiness(true)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="cancel-btn" onClick={handleBusinessCancel} disabled={isSubmittingBusiness}>
                        Cancel
                      </button>
                      <button className="save-btn" onClick={handleBusinessSave} disabled={isSubmittingBusiness}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {isSubmittingBusiness ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {isLoadingBusiness ? (
                  <div className="loading-message" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading business information...
                  </div>
                ) : businessError ? (
                  <div className="error-message" style={{ color: '#e74c3c', padding: '1rem', background: '#fee', borderRadius: '8px' }}>
                    {businessError}
                  </div>
                ) : (
                  <div className="form-grid">
                    {/* Business Logo Display & Upload */}
                    <div className="form-group full-width" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Business Logo</label>
                      
                      {/* Show current logo if exists */}
                      {businessData.businessLogo && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem',
                          padding: '1rem',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e5e5ea',
                          marginBottom: isEditingBusiness ? '1rem' : '0'
                        }}>
                          <img 
                            src={businessData.businessLogo} 
                            alt="Business Logo" 
                            style={{ 
                              width: '100px', 
                              height: '100px', 
                              objectFit: 'contain',
                              borderRadius: '8px',
                              background: 'white',
                              border: '1px solid #ddd',
                              padding: '0.5rem'
                            }} 
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                              {newLogoPreview ? 'Previous Logo' : 'Current Logo'}
                            </p>
                            {isEditingBusiness && !newLogoPreview && (
                              <button
                                type="button"
                                onClick={() => setBusinessData(prev => ({ ...prev, businessLogo: '' }))}
                                style={{
                                  marginTop: '0.5rem',
                                  padding: '0.5rem 1rem',
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                Remove Logo
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Show new logo preview if uploaded */}
                      {newLogoPreview && isEditingBusiness && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem',
                          padding: '1rem',
                          background: '#e8f5e9',
                          borderRadius: '8px',
                          border: '2px solid #4caf50',
                          marginBottom: '1rem'
                        }}>
                          <img 
                            src={newLogoPreview} 
                            alt="New Business Logo" 
                            style={{ 
                              width: '100px', 
                              height: '100px', 
                              objectFit: 'contain',
                              borderRadius: '8px',
                              background: 'white',
                              border: '1px solid #ddd',
                              padding: '0.5rem'
                            }} 
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#2e7d32', fontWeight: '600' }}>
                              ✓ New Logo (will be updated on save)
                            </p>
                            <button
                              type="button"
                              onClick={handleRemoveNewLogo}
                              style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Cancel New Logo
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Upload new logo in edit mode */}
                      {isEditingBusiness && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <input
                            type="file"
                            name="businessLogoFile"
                            onChange={handleLogoUpload}
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            style={{
                              padding: '0.75rem',
                              border: '2px dashed #654321',
                              borderRadius: '8px',
                              width: '100%',
                              cursor: 'pointer',
                              background: '#fff9f0'
                            }}
                          />
                          <span style={{ 
                            display: 'block', 
                            fontSize: '0.8rem', 
                            color: '#8E8E93', 
                            marginTop: '0.5rem',
                            fontStyle: 'italic'
                          }}>
                            {businessData.businessLogo 
                              ? 'Upload a new logo to replace the current one' 
                              : 'Upload your business logo (JPG, PNG, GIF, or WebP, max 5MB)'
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* No logo message */}
                      {!businessData.businessLogo && !isEditingBusiness && (
                        <p style={{ 
                          color: '#999', 
                          fontStyle: 'italic', 
                          margin: '0.5rem 0',
                          padding: '1rem',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          No business logo uploaded yet
                        </p>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        className="form-input"
                        placeholder="Enter business name"
                        value={businessData.businessName}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Owner Name</label>
                      <input
                        type="text"
                        name="ownerName"
                        className="form-input"
                        placeholder="Enter owner name"
                        value={businessData.ownerName}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Working City</label>
                      <input
                        type="text"
                        name="workingCity"
                        className="form-input"
                        placeholder="Enter working city"
                        value={businessData.workingCity}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Shop Address</label>
                      <input
                        type="text"
                        name="shopAddress"
                        className="form-input"
                        placeholder="Enter shop address"
                        value={businessData.shopAddress}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        className="form-input"
                        placeholder="Enter contact number"
                        value={businessData.mobileNumber}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Alternate Number</label>
                      <input
                        type="tel"
                        name="alternateNumber"
                        className="form-input"
                        placeholder="Enter alternate number"
                        value={businessData.alternateNumber}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Business Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder="Enter business email"
                        value={businessData.email}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Google Maps Link</label>
                      <input
                        type="url"
                        name="googleMapLink"
                        className="form-input"
                        placeholder="Enter Google Maps link"
                        value={businessData.googleMapLink}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Opening Time</label>
                      <input
                        type="time"
                        name="openingTime"
                        className="form-input"
                        value={businessData.openingTime}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Closing Time</label>
                      <input
                        type="time"
                        name="closingTime"
                        className="form-input"
                        value={businessData.closingTime}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Weekly Off</label>
                      <input
                        type="text"
                        name="weeklyOff"
                        className="form-input"
                        placeholder="e.g., Sunday, Monday"
                        value={businessData.weeklyOff}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Years of Experience</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        className="form-input"
                        placeholder="Enter years of experience"
                        value={businessData.yearsOfExperience}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Service Types</label>
                      <input
                        type="text"
                        name="serviceTypes"
                        className="form-input"
                        placeholder="e.g., Custom Tailoring, Alterations"
                        value={businessData.serviceTypes}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                      <span className="input-hint">Comma-separated list of services</span>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Tailoring Categories</label>
                      <input
                        type="text"
                        name="tailoringCategories"
                        className="form-input"
                        placeholder="e.g., Pant, Shirt, Suit (2-piece)"
                        value={businessData.tailoringCategories}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                      <span className="input-hint">Comma-separated list of tailoring categories</span>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        className="form-input"
                        placeholder="e.g., Wedding Suits, Corporate Wear"
                        value={businessData.specialization}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Description</label>
                      <textarea
                        name="businessDescription"
                        className="form-textarea"
                        rows="4"
                        placeholder="Tell customers about your business"
                        value={businessData.businessDescription}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Certifications & Awards</label>
                      <textarea
                        name="certifications"
                        className="form-textarea"
                        rows="2"
                        placeholder="List certifications and awards"
                        value={businessData.certifications}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Portfolio Photos</label>
                      
                      {/* Display portfolio images if they exist */}
                      {businessData.portfolioPhotos && !isEditingBusiness && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1rem',
                          padding: '1rem',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e5e5ea'
                        }}>
                          {businessData.portfolioPhotos.split(',').map((url, index) => {
                            const trimmedUrl = url.trim();
                            if (!trimmedUrl) return null;
                            return (
                              <div key={index} style={{
                                position: 'relative',
                                paddingTop: '100%',
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #ddd'
                              }}>
                                <img
                                  src={trimmedUrl}
                                  alt={`Portfolio ${index + 1}`}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#999;font-size:0.8rem;">Invalid image</div>';
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Input field for editing */}
                      {isEditingBusiness && (
                        <>
                          <input
                            type="text"
                            name="portfolioPhotos"
                            className="form-input"
                            placeholder="Portfolio photo URLs (comma-separated)"
                            value={businessData.portfolioPhotos}
                            onChange={handleBusinessInputChange}
                            disabled={!isEditingBusiness}
                          />
                          <span className="input-hint">Add URLs or base64 images of your work samples (comma-separated)</span>
                        </>
                      )}
                      
                      {!businessData.portfolioPhotos && !isEditingBusiness && (
                        <p style={{ color: '#999', fontStyle: 'italic', margin: '0.5rem 0' }}>
                          No portfolio photos added yet
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">GPS Latitude</label>
                      <input
                        type="text"
                        name="gpsLatitude"
                        className="form-input"
                        placeholder="e.g., 28.6139"
                        value={businessData.gpsLatitude}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GPS Longitude</label>
                      <input
                        type="text"
                        name="gpsLongitude"
                        className="form-input"
                        placeholder="e.g., 77.2090"
                        value={businessData.gpsLongitude}
                        onChange={handleBusinessInputChange}
                        disabled={!isEditingBusiness}
                      />
                    </div>

                  </div>
                )}
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

