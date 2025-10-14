import { useState } from 'react';
import './SignupForm.css';

const SignupForm = ({ 
  appName = "Fit Formal",
  onSignup,
  onBackToLogin,
  onTermsClick,
  onPrivacyClick,
  selectedRole
}) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    // Clear general API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number (e.g., 9876543210)';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address (e.g., user@example.com)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must include at least one lowercase letter (a-z)';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must include at least one uppercase letter (A-Z)';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include at least one number (0-9)';
    } else if (!/(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = 'Password must include a special character (@$!%*?&#)';
    }
    
    setErrors(newErrors);
    
    // Log validation errors for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors:', newErrors);
      console.log('📋 Form data:', formData);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    console.log('📝 Form submission started');
    console.log('📋 Current form data:', formData);
    
    const isValid = validateForm();
    console.log('✔️ Form is valid:', isValid);
    
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.form-input.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    setIsLoading(true);
    
    const requestPayload = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      roleName: selectedRole || 'Seller'
    };
    
    console.log('🚀 Making API call to /api/auth/signup');
    console.log('📦 Request payload:', requestPayload);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: API endpoint not available. Please ensure the backend server is running.');
      }
      
      const data = await response.json();
      console.log('✅ API Response data:', data);
      
      if (!response.ok) {
        // Handle backend validation errors
        if (data.errors && Array.isArray(data.errors)) {
          console.log('🔴 Backend validation errors:', data.errors);
          
          // Display all backend errors
          const errorMessages = data.errors.map(err => {
            if (typeof err === 'string') return err;
            if (err.message) return err.message;
            if (err.msg) return err.msg;
            return JSON.stringify(err);
          }).join('\n');
          
          setApiError(errorMessages || data.message || 'Validation failed. Please check your input.');
        } else {
          setApiError(data.message || 'Signup failed. Please try again.');
        }
        return;
      }
      
      // Call onSignup callback if provided
      if (onSignup) {
        console.log('✅ Signup successful, calling onSignup callback');
        onSignup(data);
      }
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      setApiError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-wrapper">
        {/* Header Section */}
        <div className="header-section">
          <h1 className="signup-title">
            Join <span className="app-name">Fit Formal</span> 
          </h1>
          <p className="signup-description">
            Create your account to get started
          </p>
        </div>

        {/* Signup Form */}
        <form className="signup-form" onSubmit={handleSubmit}>


          <div className="input-group">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              autoComplete="given-name"
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="input-group">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              autoComplete="family-name"
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
          
          <div className="input-group">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              autoComplete="tel"
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            {!errors.password && (
              <div className="password-hint">
                Must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&#)
              </div>
            )}
          </div>

          {/* Validation Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="validation-error-summary">
              <div className="error-summary-title">⚠️ Please fix the following errors:</div>
              <ul className="error-summary-list">
                {errors.firstName && <li>{errors.firstName}</li>}
                {errors.lastName && <li>{errors.lastName}</li>}
                {errors.phoneNumber && <li>{errors.phoneNumber}</li>}
                {errors.email && <li>{errors.email}</li>}
                {errors.password && <li>{errors.password}</li>}
              </ul>
            </div>
          )}

          {apiError && (
            <div className="api-error-message">
              {apiError}
            </div>
          )}

          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="back-to-login">
          <button 
            type="button" 
            className="back-to-login-link"
            onClick={onBackToLogin}
          >
            Already have an account? <span className="sign-in-blue">Sign In</span>
          </button>
        </div>

        {/* Legal Links */}
        <div className="legal-section">
          <p className="legal-text">
            By creating an account you agree to our{' '}
            <button type="button" className="legal-link" onClick={onTermsClick}>
              Terms & Conditions
            </button>
            {' '}and{' '}
            <button type="button" className="legal-link" onClick={onPrivacyClick}>
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
