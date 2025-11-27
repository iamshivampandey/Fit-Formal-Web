import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import MultiStepSignup from './components/MultiStepSignup'
import SplashScreen from './components/SplashScreen'
import Toast from './components/Toast'
import Home from './components/Home'
import ProductManagement from './components/ProductManagement'
import Profile from './components/Profile'
import './App.css'

function App() {
  // Initialize state from localStorage to persist across page refreshes
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    const savedView = localStorage.getItem('currentView');
    
    if (savedUser && savedView && savedView !== 'login' && savedView !== 'signup') {
      return savedView; // Restore last view if user was logged in
    }
    return 'login';
  });
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(() => {
    // Restore user from localStorage on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('currentView');
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Show splash screen for 1 second, then show login form
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('currentView');
    }
  }, [user]);

  // Save currentView to localStorage whenever it changes (except for login/signup)
  useEffect(() => {
    if (user && currentView !== 'login' && currentView !== 'signup') {
      localStorage.setItem('currentView', currentView);
    }
  }, [currentView, user]);

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
    
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('currentView');
    
    // Clear user data from state
    setUser(null);
    
    // Show toast
    showToast('You have been logged out successfully.', 'success');
    
    // Navigate back to login
    setCurrentView('login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSignupSubmit = async (data) => {
    console.log('✅ App.jsx - Signup form completed! Full Data:', data);
    console.log('🏢 App.jsx - Has businessInfo?', !!data.businessInfo);
    console.log('🏢 App.jsx - businessInfo content:', data.businessInfo);
    
    try {
      // Prepare the API request payload
      const signupPayload = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        roleName: data.role || data.roleName || 'Customer'
      };
      
      // If business info exists, add it to the signup payload
      if (data.businessInfo) {
        signupPayload.businessInfo = data.businessInfo;
        console.log('✅ Business info added to signup payload');
        console.log('🏢 Business info keys:', Object.keys(data.businessInfo));
      }
      
      console.log('🚀 Making API call to /api/auth/signup');
      console.log('📦 Complete signup payload:', signupPayload);
      
      // Call the signup API
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupPayload)
      });
      
      console.log('📡 Raw signup response status:', signupResponse.status);
      console.log('📡 Raw signup response ok?:', signupResponse.ok);
      
      const signupData = await signupResponse.json();
      console.log('📡 Signup API response (full):', JSON.stringify(signupData, null, 2));
      
      if (!signupResponse.ok) {
        console.error('❌ Signup failed with status:', signupResponse.status);
        throw new Error(signupData.message || 'Signup failed');
      }
      
      // Success! Show appropriate message
      console.log('✅ Signup successful!');
      if (data.businessInfo) {
        console.log('✅ Seller account created with business information');
        showToast('Account and business profile created successfully! Please sign in.', 'success');
      } else {
        console.log('✅ Customer account created');
        showToast('Account created successfully! Please sign in with your credentials.', 'success');
      }
      
      // Redirect to sign-in page
      setCurrentView('login');
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      showToast(error.message || 'An error occurred during signup. Please try again.', 'error');
    }
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

  const handleNavigateToProfile = () => {
    setCurrentView('profile');
  };

  // If user is not logged in, force login view (unless on signup)
  const viewToRender = !user && currentView !== 'signup' ? 'login' : currentView;

  return (
    <div className="App">
      {showSplash ? (
        <SplashScreen />
      ) : viewToRender === 'home' ? (
        <Home 
          user={user}
          onLogout={handleLogout}
          onNavigateToProducts={handleNavigateToProducts}
          onNavigateToProfile={handleNavigateToProfile}
        />
      ) : viewToRender === 'products' ? (
        <ProductManagement
          user={user}
          onBackToDashboard={handleNavigateToDashboard}
        />
      ) : viewToRender === 'profile' ? (
        <Profile
          user={user}
          onLogout={handleLogout}
          onBack={handleNavigateToDashboard}
          onShowToast={showToast}
        />
      ) : viewToRender === 'login' ? (
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
          onShowToast={showToast}
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
