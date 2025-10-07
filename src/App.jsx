import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import SplashScreen from './components/SplashScreen'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    // Show splash screen for 1 second, then show login form
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  // Example handlers for the LoginForm component
  const handleLogin = (formData) => {
    console.log('Login attempt:', formData);
    // Add your login logic here
    alert(`Login attempt with email: ${formData.email}`);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Add your Google login logic here
    alert('Google login clicked');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Add your forgot password logic here
    alert('Forgot password clicked');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked - showing signup form');
    setCurrentView('signup');
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
    setCurrentView('login');
  };

  const handleSignupSubmit = (formData) => {
    console.log('Signup attempt:', formData);
    // Add your signup logic here
    alert(`Signup attempt with: ${formData.firstName} ${formData.lastName}, ${formData.email}, ${formData.phoneNumber}`);
  };

  const handleTermsClick = () => {
    console.log('Terms & Conditions clicked');
    // Add your terms logic here
    alert('Terms & Conditions clicked');
  };

  const handlePrivacyClick = () => {
    console.log('Privacy Policy clicked');
    // Add your privacy policy logic here
    alert('Privacy Policy clicked');
  };

  const handleFaqClick = () => {
    console.log('FAQ clicked');
    // Add your FAQ logic here
    alert('FAQ clicked');
  };

  return (
    <div className="App">
      {showSplash ? (
        <SplashScreen />
      ) : currentView === 'login' ? (
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
      ) : (
        <SignupForm
          appName="Fit Formal"
          onSignup={handleSignupSubmit}
          onBackToLogin={handleBackToLogin}
          onTermsClick={handleTermsClick}
          onPrivacyClick={handlePrivacyClick}
        />
      )}
    </div>
  )
}

export default App
