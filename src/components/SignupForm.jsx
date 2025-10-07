import { useState } from 'react';
import './SignupForm.css';

const SignupForm = ({ 
  appName = "Fit Formal",
  onSignup,
  onBackToLogin,
  onTermsClick,
  onPrivacyClick
}) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && onSignup) {
      onSignup(formData);
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

          <button type="submit" className="signup-button">
            Create Account
          </button>
        </form>

        {/* Back to Login */}
        <div className="back-to-login">
          <button 
            type="button" 
            className="back-to-login-link"
            onClick={onBackToLogin}
          >
            Already have an account? Sign In
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
