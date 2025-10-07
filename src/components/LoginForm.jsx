import { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ 
  appName = "Fit Formal",
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onSignUp,
  onTermsClick,
  onPrivacyClick,
  onFaqClick
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && onLogin) {
      onLogin(formData);
    }
  };

  const handleGoogleLogin = () => {
    if (onGoogleLogin) {
      onGoogleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome to <span className="app-name">{appName}</span>
          </h1>
          <p className="welcome-description">
            Lorem ipsum dolor sit amet, <span className="faq-link" onClick={onFaqClick}>FAQ</span> about {appName}.
          </p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
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
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        {/* Forgot Password */}
        <div className="forgot-password">
          <button 
            type="button" 
            className="forgot-password-link"
            onClick={onForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        {/* Social Login */}
        <div className="social-login">
          <div className="divider">
            <span className="divider-text">Login With</span>
          </div>
          <button 
            type="button" 
            className="google-login-button"
            onClick={handleGoogleLogin}
          >
            Login with Google
          </button>
        </div>

        {/* Legal Links */}
        <div className="legal-section">
          <p className="legal-text">
            By logging in you agree to our{' '}
            <button type="button" className="legal-link" onClick={onTermsClick}>
              Terms & Conditions
            </button>
            {' '}and{' '}
            <button type="button" className="legal-link" onClick={onPrivacyClick}>
              Privacy Policy
            </button>
          </p>
          <p className="signup-text">
            Don't have an account?
            <button type="button" className="signup-link" onClick={onSignUp}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
