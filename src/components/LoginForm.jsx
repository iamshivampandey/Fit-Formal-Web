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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    console.log('📝 Login form submission started');
    console.log('📋 Current form data:', formData);
    
    const isValid = validateForm();
    console.log('✔️ Form is valid:', isValid);
    
    if (!isValid) {
      return;
    }
    
    setIsLoading(true);
    
    const requestPayload = {
      email: formData.email,
      password: formData.password
    };
    
    console.log('🚀 Making API call to /api/auth/login');
    console.log('📦 Request payload:', requestPayload);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: API endpoint not available. Please ensure the backend server is running.');
      }
      
      const data = await response.json();
      console.log('✅ API Response data:', data);
      
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          console.log('🔴 Backend validation errors:', data.errors);
          const errorMessages = data.errors.map(err => {
            if (typeof err === 'string') return err;
            if (err.message) return err.message;
            if (err.msg) return err.msg;
            return JSON.stringify(err);
          }).join('\n');
          setApiError(errorMessages || data.message || 'Login failed. Please check your credentials.');
        } else {
          setApiError(data.message || 'Login failed. Please check your credentials.');
        }
        return;
      }
      
      if (onLogin) {
        console.log('✅ Login successful, calling onLogin callback');
        onLogin(data);
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      setApiError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
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
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {apiError && (
            <div className="api-error-message">
              {apiError}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
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
