import { useState } from 'react';
import LoginForm from './LoginForm';

const HandleLoginFormPage = () => {
  const [loginStatus, setLoginStatus] = useState('');

  const handleLogin = async (formData) => {
    setLoginStatus('Logging in...');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example validation
      if (formData.email === 'demo@example.com' && formData.password === 'password') {
        setLoginStatus('Login successful!');
        console.log('Login successful:', formData);
      } else {
        setLoginStatus('Invalid credentials');
        console.log('Login failed:', formData);
      }
    } catch (error) {
      setLoginStatus('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = () => {
    setLoginStatus('Redirecting to Google...');
    console.log('Google login initiated');
    // In a real app, you would redirect to Google OAuth
    setTimeout(() => {
      setLoginStatus('Google login would redirect to OAuth');
    }, 1000);
  };

  const handleForgotPassword = () => {
    setLoginStatus('Redirecting to password reset...');
    console.log('Forgot password clicked');
    // In a real app, you would redirect to password reset page
    setTimeout(() => {
      setLoginStatus('Password reset email sent');
    }, 1000);
  };

  const handleSignUp = () => {
    setLoginStatus('Redirecting to sign up...');
    console.log('Sign up clicked');
    // In a real app, you would redirect to sign up page
    setTimeout(() => {
      setLoginStatus('Redirecting to registration form');
    }, 1000);
  };

  const handleTermsClick = () => {
    console.log('Terms & Conditions clicked');
    // In a real app, you would open terms modal or redirect
    setLoginStatus('Opening Terms & Conditions...');
  };

  const handlePrivacyClick = () => {
    console.log('Privacy Policy clicked');
    // In a real app, you would open privacy modal or redirect
    setLoginStatus('Opening Privacy Policy...');
  };

  const handleFaqClick = () => {
    console.log('FAQ clicked');
    // In a real app, you would open FAQ modal or redirect
    setLoginStatus('Opening FAQ...');
  };

  return (
    <div style={{ position: 'relative' }}>
      <LoginForm
        appName="Fit Formal"
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onForgotPassword={handleForgotPassword}
        onSignUp={handleSignUp}
        onTermsClick={handleTermsClick}
        onPrivacyClick={handlePrivacyClick}
        onFaqClick={handleFaqClick}
      />
      
      {loginStatus && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#007AFF',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          {loginStatus}
        </div>
      )}
    </div>
  );
};

export default HandleLoginFormPage;
