import React, { useState, useEffect } from 'react';

const AddressInput = ({ user, onNext, onBack, initialAddress, addressType = 'Delivery' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    deliveryInstructions: '',
    googleMapLink: ''
  });

  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Fetch saved addresses
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!user) {
        setIsLoadingAddresses(false);
        return;
      }

      setIsLoadingAddresses(true);
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        
        const authToken = user?.token || localStorage.getItem('token') || localStorage.getItem('authToken');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch('/api/my-delivery-addresses', {
          method: 'GET',
          headers: headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSavedAddresses(Array.isArray(data.data) ? data.data : []);
          } else {
            setSavedAddresses([]);
          }
        } else {
          setSavedAddresses([]);
        }
      } catch (error) {
        console.error('Error fetching saved addresses:', error);
        setSavedAddresses([]);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchSavedAddresses();
  }, [user]);

  // Initialize form data from user or initialAddress
  useEffect(() => {
    // Always show saved addresses first if they exist
    // Only show form if no saved addresses exist
    if (savedAddresses.length > 0) {
      // If saved addresses exist, show them first (don't show form initially)
      setShowNewAddressForm(false);
      // Pre-fill form with user data for when they click "Add New"
      if (user) {
        const userAddress = user?.deliveryAddress || {};
        setFormData({
          fullName: userAddress.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : '') || user?.fullName || user?.name || '',
          phoneNumber: userAddress.phoneNumber || user?.phoneNumber || user?.phone || '',
          alternatePhone: userAddress.alternatePhone || user?.alternatePhone || '',
          addressLine1: userAddress.addressLine1 || user?.address || user?.addressLine1 || '',
          addressLine2: userAddress.addressLine2 || user?.addressLine2 || '',
          landmark: userAddress.landmark || user?.landmark || '',
          city: userAddress.city || user?.city || '',
          state: userAddress.state || user?.state || '',
          pincode: userAddress.pincode || user?.pincode || user?.zipCode || '',
          addressType: userAddress.addressType || user?.addressType || 'Home',
          deliveryInstructions: userAddress.deliveryInstructions || user?.deliveryInstructions || '',
          googleMapLink: userAddress.googleMapLink || user?.googleMapLink || ''
        });
      }
    } else {
      // No saved addresses - show form directly
      if (initialAddress) {
        setFormData(initialAddress);
      } else if (user) {
        const userAddress = user?.deliveryAddress || {};
        setFormData({
          fullName: userAddress.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : '') || user?.fullName || user?.name || '',
          phoneNumber: userAddress.phoneNumber || user?.phoneNumber || user?.phone || '',
          alternatePhone: userAddress.alternatePhone || user?.alternatePhone || '',
          addressLine1: userAddress.addressLine1 || user?.address || user?.addressLine1 || '',
          addressLine2: userAddress.addressLine2 || user?.addressLine2 || '',
          landmark: userAddress.landmark || user?.landmark || '',
          city: userAddress.city || user?.city || '',
          state: userAddress.state || user?.state || '',
          pincode: userAddress.pincode || user?.pincode || user?.zipCode || '',
          addressType: userAddress.addressType || user?.addressType || 'Home',
          deliveryInstructions: userAddress.deliveryInstructions || user?.deliveryInstructions || '',
          googleMapLink: userAddress.googleMapLink || user?.googleMapLink || ''
        });
      }
      setShowNewAddressForm(true);
    }
  }, [user, initialAddress, savedAddresses.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.replace(/\D/g, ''))) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.deliveryAddressId || address.id);
    setFormData({
      fullName: address.fullName || '',
      phoneNumber: address.phoneNumber || '',
      alternatePhone: address.alternatePhone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city?.replace(/^string:/, '') || '',
      state: address.state || '',
      pincode: address.pincode || '',
      addressType: address.addressType || 'Home',
      deliveryInstructions: address.deliveryInstructions || '',
      googleMapLink: address.googleMapLink || ''
    });
    setShowNewAddressForm(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    // Reset form to empty or user defaults
    const userAddress = user?.deliveryAddress || {};
    setFormData({
      fullName: userAddress.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : '') || user?.fullName || user?.name || '',
      phoneNumber: userAddress.phoneNumber || user?.phoneNumber || user?.phone || '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'Home',
      deliveryInstructions: '',
      googleMapLink: ''
    });
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (selectedAddressId && !showNewAddressForm) {
      // Use selected address - formData is already populated
      // Pass both address data and addressId
      onNext(formData, selectedAddressId);
    } else {
      // Validate and submit new address
      if (validateForm()) {
        onNext(formData, null);
      }
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        color: '#654321', 
        marginBottom: '0.5rem' 
      }}>
        {addressType === 'Measurement' ? 'Measurement Address' : 'Delivery Address'}
      </h3>
      <p style={{ 
        fontSize: '0.875rem', 
        color: '#8E8E93', 
        marginBottom: '1.5rem' 
      }}>
        {savedAddresses.length > 0 
          ? `Select a saved ${addressType.toLowerCase()} address or add a new one`
          : `Please provide your ${addressType.toLowerCase()} address for the order`
        }
      </p>

      {/* Saved Addresses List */}
      {isLoadingAddresses ? (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#8E8E93' 
        }}>
          Loading saved addresses...
        </div>
      ) : savedAddresses.length > 0 && !showNewAddressForm ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            {savedAddresses.map((address) => {
              const addressId = address.deliveryAddressId || address.id;
              const isSelected = selectedAddressId === addressId;
              return (
                <div
                  key={addressId}
                  onClick={() => handleSelectAddress(address)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #654321' : '1px solid #E5E5EA',
                    backgroundColor: isSelected ? '#FFF8F0' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#654321';
                      e.currentTarget.style.backgroundColor = '#F5F3F0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#E5E5EA';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: '#654321',
                        marginBottom: '0.25rem'
                      }}>
                        {address.fullName}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: '#8E8E93',
                        marginBottom: '0.25rem'
                      }}>
                        {address.phoneNumber}
                        {address.alternatePhone && ` / ${address.alternatePhone}`}
                      </div>
                    </div>
                    {address.addressType && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#FFF3E0',
                        color: '#654321',
                        border: '1px solid #654321'
                      }}>
                        {address.addressType}
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#1c1c1c',
                    lineHeight: '1.5'
                  }}>
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                    {address.landmark && `, Near ${address.landmark}`}
                    <br />
                    {address.city?.replace(/^string:/, '')}, {address.state} - {address.pincode}
                  </div>
                  {isSelected && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#654321',
                      fontWeight: 600
                    }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleAddNewAddress}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px dashed #654321',
              backgroundColor: 'transparent',
              color: '#654321',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF8F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Address
          </button>
        </div>
      ) : null}

      {/* New Address Form */}
      {showNewAddressForm && (
        <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Full Name <span style={{ color: '#ff3b30' }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: errors.fullName ? '2px solid #ff3b30' : '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            {errors.fullName && (
              <span style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                color: '#ff3b30', 
                marginTop: '0.25rem' 
              }}>
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Phone Number <span style={{ color: '#ff3b30' }}>*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: errors.phoneNumber ? '2px solid #ff3b30' : '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            {errors.phoneNumber && (
              <span style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                color: '#ff3b30', 
                marginTop: '0.25rem' 
              }}>
                {errors.phoneNumber}
              </span>
            )}
          </div>

          {/* Alternate Phone */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Alternate Phone (Optional)
            </label>
            <input
              type="tel"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleInputChange}
              placeholder="Enter alternate phone number"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Address Line 1 <span style={{ color: '#ff3b30' }}>*</span>
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="House/Flat No., Building Name"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: errors.addressLine1 ? '2px solid #ff3b30' : '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            {errors.addressLine1 && (
              <span style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                color: '#ff3b30', 
                marginTop: '0.25rem' 
              }}>
                {errors.addressLine1}
              </span>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Street, Area"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Landmark */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              placeholder="Near Park, School, etc."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* City and State Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#1c1c1c', 
                marginBottom: '0.5rem' 
              }}>
                City <span style={{ color: '#ff3b30' }}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: errors.city ? '2px solid #ff3b30' : '1px solid #E5E5EA',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.city && (
                <span style={{ 
                  display: 'block', 
                  fontSize: '0.75rem', 
                  color: '#ff3b30', 
                  marginTop: '0.25rem' 
                }}>
                  {errors.city}
                </span>
              )}
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#1c1c1c', 
                marginBottom: '0.5rem' 
              }}>
                State <span style={{ color: '#ff3b30' }}>*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: errors.state ? '2px solid #ff3b30' : '1px solid #E5E5EA',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.state && (
                <span style={{ 
                  display: 'block', 
                  fontSize: '0.75rem', 
                  color: '#ff3b30', 
                  marginTop: '0.25rem' 
                }}>
                  {errors.state}
                </span>
              )}
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Pincode <span style={{ color: '#ff3b30' }}>*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit pincode"
              maxLength="6"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: errors.pincode ? '2px solid #ff3b30' : '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            {errors.pincode && (
              <span style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                color: '#ff3b30', 
                marginTop: '0.25rem' 
              }}>
                {errors.pincode}
              </span>
            )}
          </div>

          {/* Address Type */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.75rem' 
            }}>
              Address Type
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '1rem' 
            }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, addressType: 'Home' }))}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: formData.addressType === 'Home' ? '2px solid #654321' : '1px solid #E5E5EA',
                  backgroundColor: formData.addressType === 'Home' ? '#F5F3F0' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (formData.addressType !== 'Home') {
                    e.currentTarget.style.backgroundColor = '#F2F2F7';
                    e.currentTarget.style.borderColor = '#c0c0c0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.addressType !== 'Home') {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#E5E5EA';
                  }
                }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={formData.addressType === 'Home' ? '#654321' : '#8E8E93'} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: formData.addressType === 'Home' ? 600 : 500,
                  color: formData.addressType === 'Home' ? '#654321' : '#8E8E93'
                }}>
                  Home
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, addressType: 'Work' }))}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: formData.addressType === 'Work' ? '2px solid #654321' : '1px solid #E5E5EA',
                  backgroundColor: formData.addressType === 'Work' ? '#F5F3F0' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (formData.addressType !== 'Work') {
                    e.currentTarget.style.backgroundColor = '#F2F2F7';
                    e.currentTarget.style.borderColor = '#c0c0c0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.addressType !== 'Work') {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#E5E5EA';
                  }
                }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={formData.addressType === 'Work' ? '#654321' : '#8E8E93'} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: formData.addressType === 'Work' ? 600 : 500,
                  color: formData.addressType === 'Work' ? '#654321' : '#8E8E93'
                }}>
                  Office
                </span>
              </button>
            </div>
          </div>

          {/* Google Map Link */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#1c1c1c', 
              marginBottom: '0.5rem' 
            }}>
              Google Map Link (Optional)
            </label>
            <input
              type="url"
              name="googleMapLink"
              value={formData.googleMapLink}
              onChange={handleInputChange}
              placeholder="https://maps.google.com/..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E5E5EA',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => {
                if (showNewAddressForm && savedAddresses.length > 0) {
                  setShowNewAddressForm(false);
                  setSelectedAddressId(null);
                } else {
                  onBack();
                }
              }}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid #c0c0c0',
                color: '#666',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f8f8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              {showNewAddressForm && savedAddresses.length > 0 ? 'Back to Saved' : 'Back'}
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                backgroundColor: '#654321',
                color: '#ffffff',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#7d5a2e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#654321';
              }}
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {/* Action Buttons for Selected Address */}
      {!showNewAddressForm && selectedAddressId && savedAddresses.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '2px solid #c0c0c0',
              color: '#666',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f8f8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#654321',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7d5a2e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#654321';
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressInput;

