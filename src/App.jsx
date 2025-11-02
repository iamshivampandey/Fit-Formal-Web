import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import MultiStepSignup from './components/MultiStepSignup'
import SplashScreen from './components/SplashScreen'
import Toast from './components/Toast'
import Home from './components/Home'
import ProductManagement from './components/ProductManagement'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'home', or 'products'
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Show splash screen for 1 second, then show login form
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  // Example handlers for the LoginForm component
  const handleLogin = (response) => {
    console.log('✅ Login successful! API Response:', response);
    
    // Extract user and role information from the response
    const userData = response.data?.user || response.user;
    const roles = response.data?.roles || response.roles || [];
    const token = response.data?.token || response.token;
    
    // Get the first role (primary role)
    const primaryRole = roles[0];
    
    console.log('👤 User:', userData);
    console.log('🎭 Roles:', roles);
    console.log('🎭 Primary Role:', primaryRole);
    console.log('🔑 Token:', token ? 'Received' : 'Not found');
    
    // Combine user data with role information
    const userWithRole = {
      ...userData,
      roleId: primaryRole?.id,
      roleName: primaryRole?.name,
      roles: roles,
      token: token
    };
    
    console.log('💾 Storing combined user data:', userWithRole);
    setUser(userWithRole);
    
    // Show success toast
    showToast(`Login successful! Welcome back, ${userData.firstName}!`, 'success');
    
    // Navigate to home screen
    setCurrentView('home');
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

  const handleLogout = () => {
    console.log('Logout clicked');
    
    // Clear user data
    setUser(null);
    
    // Show toast
    showToast('You have been logged out successfully.', 'success');
    
    // Navigate back to login
    setCurrentView('login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSignupSubmit = (data) => {
    console.log('✅ Signup successful! API Response:', data);
    
    // Show success toast message
    showToast('Account created successfully! Please sign in with your credentials.', 'success');
    
    // Redirect to sign-in page
    setCurrentView('login');
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

  /**
   * Navigation handlers
   */
  const handleNavigateToProducts = () => {
    setCurrentView('products');
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('home');
  };

  return (
    <div className="App">
      {showSplash ? (
        <SplashScreen />
      ) : currentView === 'home' ? (
        <Home 
          user={user}
          onLogout={handleLogout}
          onNavigateToProducts={handleNavigateToProducts}
        />
      ) : currentView === 'products' ? (
        <ProductManagement
          user={user}
          onBackToDashboard={handleNavigateToDashboard}
        />
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
        <MultiStepSignup
          onBackToLogin={handleBackToLogin}
          onSignupComplete={handleSignupSubmit}
        />
      )}
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
