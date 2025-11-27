import { useState } from 'react';
import './BusinessInfoForm.css';

const BusinessInfoForm = ({ 
  onSubmit,
  onBack,
  sellerType = '',
  initialData = {},
  businessId = null,  // Add businessId prop for edit mode
  userId = null,      // Add userId prop
  authToken = null,   // Add auth token prop
  onShowToast = null  // Add toast callback prop
}) => {
  // Check if we're in edit mode
  const isEditMode = !!businessId;
  
  // Check if user is a Tailor or TaylorSeller (services apply to both)
  const isTailorRole = sellerType === 'Tailor' || sellerType === 'Taylorseller';
  const [formData, setFormData] = useState({
    // Basic Information
    businessName: initialData.businessName || '',
    ownerName: initialData.ownerName || '',
    businessLogo: initialData.businessLogo || '',
    businessDescription: initialData.businessDescription || '',
    
    // Contact & Location
    mobileNumber: initialData.mobileNumber || '',
    alternateNumber: initialData.alternateNumber || '',
    email: initialData.email || '',
    shopAddress: initialData.shopAddress || '',
    googleMapLink: initialData.googleMapLink || '',
    gpsLatitude: initialData.gpsLatitude || '',
    gpsLongitude: initialData.gpsLongitude || '',
    workingCity: initialData.workingCity || '',
    
    // Services Details
    serviceTypes: initialData.serviceTypes || [],
    specialization: initialData.specialization || '',
    
    // Experience
    yearsOfExperience: initialData.yearsOfExperience || '',
    portfolioPhotos: initialData.portfolioPhotos || [],
    certifications: initialData.certifications || '',
    
    // Availability
    openingTime: initialData.openingTime || '',
    closingTime: initialData.closingTime || '',
    weeklyOff: initialData.weeklyOff || ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse serviceTypes if it's a JSON string, otherwise use as array
  const parseServiceTypes = (services) => {
    if (!services) return [];
    if (Array.isArray(services)) return services;
    if (typeof services === 'string') {
      try {
        return JSON.parse(services);
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  
  const [selectedServices, setSelectedServices] = useState(parseServiceTypes(initialData.serviceTypes));
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData.businessLogo || '');

  const serviceOptions = [
    'Custom Tailoring',
    'Alterations',
    'Formal Suits',
    'Wedding Attire',
    'Party Wear',
    'Fabric Sales',
    'Measurements at Home',
    'Express Service'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (apiError) {
      setApiError('');
    }
  };

  const handleServiceToggle = (service) => {
    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(updatedServices);
    setFormData(prev => ({
      ...prev,
      serviceTypes: updatedServices
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          businessLogo: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          businessLogo: 'Image size should be less than 5MB'
        }));
        return;
      }
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        businessLogo: ''
      }));
      
      // Store the file
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          businessLogo: reader.result // Store base64 for now
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({
      ...prev,
      businessLogo: ''
    }));
    // Reset the file input
    const fileInput = document.querySelector('input[name="businessLogo"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }
    
    if (!formData.workingCity.trim()) {
      newErrors.workingCity = 'Working city is required';
    }
    
    // Service types required only for Tailor roles
    if (isTailorRole && selectedServices.length === 0) {
      newErrors.serviceTypes = 'Please select at least one service';
    }
    
    // Optional email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    // GPS coordinates validation if provided
    if (formData.gpsLatitude && (isNaN(formData.gpsLatitude) || formData.gpsLatitude < -90 || formData.gpsLatitude > 90)) {
      newErrors.gpsLatitude = 'Latitude must be between -90 and 90';
    }
    
    if (formData.gpsLongitude && (isNaN(formData.gpsLongitude) || formData.gpsLongitude < -180 || formData.gpsLongitude > 180)) {
      newErrors.gpsLongitude = 'Longitude must be between -180 and 180';
    }
    
    // Years of experience validation
    if (formData.yearsOfExperience && (isNaN(formData.yearsOfExperience) || formData.yearsOfExperience < 0)) {
      newErrors.yearsOfExperience = 'Please enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Prevent duplicate submissions
    if (isSubmitting || isLoading) {
      console.log('⚠️ Submission already in progress, ignoring duplicate request');
      return;
    }
    
    const isValid = validateForm();
    
    if (!isValid) {
      const firstErrorField = document.querySelector('.form-input.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    setIsLoading(true);
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const businessData = {
        ...formData,
        serviceTypes: JSON.stringify(selectedServices),
        portfolioPhotos: JSON.stringify(formData.portfolioPhotos)
      };
      
      console.log('🏢 BusinessInfoForm - Submitting business data:', businessData);
      console.log('📋 Selected services:', selectedServices);
      console.log('🖼️ Logo file:', logoFile);
      console.log('🖼️ Logo preview:', logoPreview ? 'Present' : 'None');
      console.log('📝 Edit mode:', isEditMode);
      console.log('🆔 Business ID:', businessId);
      
      // If in edit mode, call the API directly
      if (isEditMode && businessId && authToken) {
        console.log('🔄 Calling PUT API to update business...');
        
        const response = await fetch(`/api/business/${businessId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            ...businessData
          })
        });
        
        const data = await response.json();
        console.log('📡 API Response:', data);
        
        if (response.ok && data.success) {
          console.log('✅ Business updated successfully');
          setApiError('');
          
          // Show success toast
          if (onShowToast) {
            onShowToast('Business information updated successfully!', 'success');
          }
          
          // Don't call onSubmit in edit mode - we already updated via API
          // onSubmit is only for create mode during signup
        } else {
          throw new Error(data.message || 'Failed to update business information');
        }
      } else {
        // Create mode - use callback
        console.log('📤 Passing data to parent component (create mode)');
        if (onSubmit) {
          await onSubmit(businessData);
        }
      }
    } catch (error) {
      console.error('❌ Business info submission error:', error);
      setApiError(error.message || 'An error occurred. Please try again.');
      
      // Show error toast
      if (onShowToast) {
        onShowToast(error.message || 'An error occurred. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="business-info-container">
      <div className="business-info-wrapper">
        {/* Header Section */}
        <div className="header-section">
          <h1 className="business-info-title">
            {isEditMode ? 'Edit Business' : 'Business'} <span className="app-name">Information</span>
          </h1>
          <p className="business-info-description">
            {isEditMode 
              ? 'Update your business information' 
              : 'Tell us about your business to complete your profile'
            }
          </p>
        </div>

        <form className="business-info-form" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            
            <div className="input-group">
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Business Name *"
                className={`form-input ${errors.businessName ? 'error' : ''}`}
              />
              {errors.businessName && <span className="error-message">{errors.businessName}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder="Owner Name"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="service-label">Business Logo</label>
              
              {/* Show existing logo if available and no new upload */}
              {formData.businessLogo && !logoPreview && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e5e5ea',
                  marginBottom: '1rem'
                }}>
                  <img 
                    src={formData.businessLogo} 
                    alt="Current Business Logo" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: 'white',
                      border: '1px solid #ddd',
                      padding: '0.5rem'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                      Current Logo
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#999' }}>
                      Upload a new file to replace
                    </p>
                  </div>
                </div>
              )}
              
              {/* Show new logo preview if uploaded */}
              {logoPreview && (
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
                    src={logoPreview} 
                    alt="New Business Logo Preview" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: 'white',
                      border: '1px solid #ddd',
                      padding: '0.5rem'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#2e7d32', fontWeight: '600' }}>
                      ✓ New Logo Selected
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
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
                      Remove New Logo
                    </button>
                  </div>
                </div>
              )}
              
              {/* Custom styled file upload */}
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <label htmlFor="businessLogoInput" className="custom-file-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Choose file
                </label>
                <input
                  type="file"
                  name="businessLogo"
                  id="businessLogoInput"
                  onChange={handleLogoUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  style={{
                    position: 'absolute',
                    width: '0.1px',
                    height: '0.1px',
                    opacity: 0,
                    overflow: 'hidden',
                    zIndex: -1
                  }}
                />
                {logoFile && (
                  <span style={{
                    marginLeft: '1rem',
                    color: '#666',
                    fontSize: '0.9rem',
                    verticalAlign: 'middle'
                  }}>
                    {logoFile.name}
                  </span>
                )}
                {!logoFile && !formData.businessLogo && (
                  <span style={{
                    marginLeft: '1rem',
                    color: '#999',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    verticalAlign: 'middle'
                  }}>
                    No file chosen
                  </span>
                )}
              </div>
              
              <span className="input-hint">
                {formData.businessLogo || logoPreview 
                  ? 'Upload a new logo to replace the current one' 
                  : 'Upload your business logo (JPG, PNG, GIF, or WebP, max 5MB)'
                }
              </span>
              {errors.businessLogo && <span className="error-message">{errors.businessLogo}</span>}
            </div>

            <div className="input-group">
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Business Description"
                className="form-input textarea-input"
                rows="4"
              />
              <span className="input-hint">Tell customers about your business and services</span>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="form-section">
            <h2 className="section-title">Contact & Location</h2>
            
            <div className="input-group">
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Mobile Number *"
                className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
              />
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
            </div>

            <div className="input-group">
              <input
                type="tel"
                name="alternateNumber"
                value={formData.alternateNumber}
                onChange={handleInputChange}
                placeholder="Alternate Number"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Business Email"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="workingCity"
                value={formData.workingCity}
                onChange={handleInputChange}
                placeholder="Working City *"
                className={`form-input ${errors.workingCity ? 'error' : ''}`}
              />
              {errors.workingCity && <span className="error-message">{errors.workingCity}</span>}
            </div>

            <div className="input-group">
              <textarea
                name="shopAddress"
                value={formData.shopAddress}
                onChange={handleInputChange}
                placeholder="Shop/Business Address"
                className="form-input textarea-input"
                rows="2"
              />
            </div>

            <div className="input-group">
              <input
                type="url"
                name="googleMapLink"
                value={formData.googleMapLink}
                onChange={handleInputChange}
                placeholder="Google Maps Link"
                className="form-input"
              />
              <span className="input-hint">Share your location for easier navigation</span>
            </div>

            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  name="gpsLatitude"
                  value={formData.gpsLatitude}
                  onChange={handleInputChange}
                  placeholder="GPS Latitude"
                  className={`form-input ${errors.gpsLatitude ? 'error' : ''}`}
                />
                {errors.gpsLatitude && <span className="error-message">{errors.gpsLatitude}</span>}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="gpsLongitude"
                  value={formData.gpsLongitude}
                  onChange={handleInputChange}
                  placeholder="GPS Longitude"
                  className={`form-input ${errors.gpsLongitude ? 'error' : ''}`}
                />
                {errors.gpsLongitude && <span className="error-message">{errors.gpsLongitude}</span>}
              </div>
            </div>
          </div>

          {/* Services Section - Only for Tailor roles */}
          {isTailorRole && (
            <div className="form-section">
              <h2 className="section-title">Services Details</h2>
              
              <div className="input-group">
                <label className="service-label">Service Types *</label>
                <div className="service-chips">
                  {serviceOptions.map((service) => (
                    <button
                      key={service}
                      type="button"
                      className={`service-chip ${selectedServices.includes(service) ? 'selected' : ''}`}
                      onClick={() => handleServiceToggle(service)}
                    >
                      {service}
                    </button>
                  ))}
                </div>
                {errors.serviceTypes && <span className="error-message">{errors.serviceTypes}</span>}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="Specialization (e.g., Wedding Suits, Corporate Wear)"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Experience Section */}
          <div className="form-section">
            <h2 className="section-title">Experience & Portfolio</h2>
            
            <div className="input-group">
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                placeholder="Years of Experience"
                min="0"
                className={`form-input ${errors.yearsOfExperience ? 'error' : ''}`}
              />
              {errors.yearsOfExperience && <span className="error-message">{errors.yearsOfExperience}</span>}
            </div>

            <div className="input-group">
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                placeholder="Certifications & Awards"
                className="form-input textarea-input"
                rows="2"
              />
              <span className="input-hint">List any professional certifications or awards</span>
            </div>
          </div>

          {/* Availability Section */}
          <div className="form-section">
            <h2 className="section-title">Business Hours</h2>
            
            <div className="input-row">
              <div className="input-group">
                <label className="time-label">Opening Time</label>
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="time-label">Closing Time</label>
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="weeklyOff"
                value={formData.weeklyOff}
                onChange={handleInputChange}
                placeholder="Weekly Off (e.g., Sunday, Monday)"
                className="form-input"
              />
            </div>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="validation-error-summary">
              <div className="error-summary-title">⚠️ Please fix the following errors:</div>
              <ul className="error-summary-list">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {apiError && (
            <div className="api-error-message">
              {apiError}
            </div>
          )}

          <div className="button-group">
            <button 
              type="button" 
              className="back-button"
              onClick={onBack}
              disabled={isLoading}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading || isSubmitting}
            >
              {(isLoading || isSubmitting)
                ? (isEditMode ? 'Updating...' : 'Submitting...') 
                : (isEditMode ? 'Update Business Info' : 'Complete Registration')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessInfoForm;

