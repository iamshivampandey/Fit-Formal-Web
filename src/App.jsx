import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import MultiStepSignup from './components/MultiStepSignup'
import SplashScreen from './components/SplashScreen'
import Toast from './components/Toast'
import Home from './components/Home'
import ProductManagement from './components/ProductManagement'
import Profile from './components/Profile'
import TailorsListPage from './components/TailorsListPage'
import OrdersPerDay from './components/OrdersPerDay'
import BookingPage from './components/booking/BookingPage'
import OrderDetails from './components/OrderDetails'
import OrderDetailsPerDay from './components/OrderDetailsPerDay'
import MyOrders from './components/MyOrders'
import './App.css'

function App() {
  // Initialize state from localStorage to persist across page refreshes
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    const savedView = localStorage.getItem('currentView');
    const hasSignupState = localStorage.getItem('signupStep'); // Check if signup flow is in progress
    
    // Only restore signup view if:
    // 1. No user is logged in
    // 2. The saved view is 'signup'
    // 3. There's actual signup state (signupStep exists)
    if (!savedUser && savedView === 'signup' && hasSignupState) {
      return 'signup';
    }
    
    // Restore other views only if user is logged in
    if (savedUser && savedView && savedView !== 'login' && savedView !== 'signup') {
      return savedView;
    }
    
    // If user is logged in but view is signup, clear signup state and go to home
    if (savedUser && savedView === 'signup') {
      // Clear any leftover signup state
      localStorage.removeItem('signupStep');
      localStorage.removeItem('selectedRole');
      localStorage.removeItem('selectedSellerType');
      localStorage.removeItem('signupFormData');
      localStorage.removeItem('businessInfoData');
      return 'home';
    }
    
    return 'login';
  });
  const [toast, setToast] = useState(null);
  const [bookingData, setBookingData] = useState(() => {
    // Restore bookingData from localStorage on mount
    const savedBookingData = localStorage.getItem('bookingData');
    if (savedBookingData) {
      try {
        return JSON.parse(savedBookingData);
      } catch (e) {
        console.error('Error parsing saved bookingData:', e);
        localStorage.removeItem('bookingData');
        return null;
      }
    }
    return null;
  });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetailsPerDayData, setOrderDetailsPerDayData] = useState(null);
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
      // Clear signup state when user logs in (signup is complete)
      if (currentView !== 'signup') {
        localStorage.removeItem('signupStep');
        localStorage.removeItem('selectedRole');
        localStorage.removeItem('selectedSellerType');
        localStorage.removeItem('signupFormData');
        localStorage.removeItem('businessInfoData');
      }
    } else {
      localStorage.removeItem('user');
      // Only clear currentView if it's not signup (to preserve signup flow)
      const savedView = localStorage.getItem('currentView');
      if (savedView !== 'signup') {
        localStorage.removeItem('currentView');
      }
    }
  }, [user, currentView]);

  // Save bookingData to localStorage whenever it changes
  useEffect(() => {
    if (bookingData) {
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
    } else {
      // Only remove if we're not on the booking page (to avoid clearing during navigation)
      if (currentView !== 'booking') {
        localStorage.removeItem('bookingData');
      }
    }
  }, [bookingData, currentView]);

  // Save currentView to localStorage whenever it changes
  useEffect(() => {
    // Save signup view even when user is not logged in
    if (currentView === 'signup') {
      localStorage.setItem('currentView', currentView);
    }
    // Save other views only when user is logged in (except login)
    else if (user && currentView !== 'login') {
      localStorage.setItem('currentView', currentView);
      // Clear signup state when navigating away from signup to other pages
      localStorage.removeItem('signupStep');
      localStorage.removeItem('selectedRole');
      localStorage.removeItem('selectedSellerType');
      localStorage.removeItem('signupFormData');
      localStorage.removeItem('businessInfoData');
      
      // Clear bookingData when navigating away from booking page
      if (currentView !== 'booking') {
        localStorage.removeItem('bookingData');
      }
      
      // Clear selectedTailor when navigating away from tailors page
      if (currentView !== 'tailors') {
        localStorage.removeItem('selectedTailor');
      }
    }
    // Clear currentView and signup state when going back to login
    else if (currentView === 'login') {
      localStorage.removeItem('currentView');
      localStorage.removeItem('signupStep');
      localStorage.removeItem('selectedRole');
      localStorage.removeItem('selectedSellerType');
      localStorage.removeItem('signupFormData');
      localStorage.removeItem('businessInfoData');
      localStorage.removeItem('bookingData');
      localStorage.removeItem('selectedTailor');
    }
  }, [currentView, user]);

  // Example handlers for the LoginForm component
  const handleLogin = (response) => {
    console.log('✅ Login successful! API Response:', response);
    
    // Extract user and role information from the response
    const userData = response.data?.user || response.user;
    const roles = response.data?.roles || response.roles || [];
    const token = response.data?.token || response.token;
    
    // Get BusinessId from userData (API returns it as BusinessId with capital B)
    const businessId = userData?.BusinessId || userData?.businessId;
    
    // Get the first role (primary role)
    const primaryRole = roles[0];
    
    console.log('👤 User:', userData);
    console.log('🎭 Roles:', roles);
    console.log('🎭 Primary Role:', primaryRole);
    console.log('🔑 Token:', token ? 'Received' : 'Not found');
    console.log('🏢 BusinessId:', businessId);
    
    // Combine user data with role information
    const userWithRole = {
      ...userData,
      roleId: primaryRole?.id,
      roleName: primaryRole?.name,
      roles: roles,
      token: token,
      businessId: businessId, // Normalize to lowercase for consistency
      BusinessId: businessId // Keep original case for compatibility
    };
    
    console.log('💾 Storing combined user data:', userWithRole);
    setUser(userWithRole);
    
    // Clear any leftover signup state after successful login
    localStorage.removeItem('signupStep');
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('selectedSellerType');
    localStorage.removeItem('signupFormData');
    localStorage.removeItem('businessInfoData');
    
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
    localStorage.removeItem('bookingData');
    localStorage.removeItem('selectedTailor');
    
    // Clear user data from state
    setUser(null);
    setBookingData(null);
    
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
      // Normalize role name - API might expect specific format
      let roleName = data.role || data.roleName || 'Customer';
      
      // Normalize MeasurementBoy to the format API expects
      // Try both formats: "Measurement Boy" (with space) and "MeasurementBoy" (without space)
      if (roleName === 'MeasurementBoy') {
        roleName = 'MeasurementBoy'; // API likely expects space-separated format
      }
      
      const signupPayload = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        roleName: roleName
      };
      
      console.log('🎭 Normalized roleName:', roleName, '(original:', data.role || data.roleName, ')');
      
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

  const handleNavigateToTailors = () => {
    setCurrentView('tailors');
  };

  const handleNavigateToOrdersPerDay = () => {
    setCurrentView('ordersPerDay');
  };

  const handleNavigateToOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentView('orderDetails');
  };

  const handleBackFromOrderDetails = () => {
    setSelectedOrderId(null);
    setCurrentView('home');
  };

  const handleNavigateToOrderDetailsPerDay = (businessId, date) => {
    setOrderDetailsPerDayData({ businessId, date });
    setCurrentView('orderDetailsPerDay');
  };

  const handleBackFromOrderDetailsPerDay = () => {
    setOrderDetailsPerDayData(null);
    setCurrentView('ordersPerDay');
  };

  const handleNavigateToMyOrders = () => {
    setCurrentView('myOrders');
  };

  const handleBackFromMyOrders = () => {
    setCurrentView('home');
  };

  const handleNavigateToBooking = (tailorData) => {
    setBookingData(tailorData);
    // Save bookingData to localStorage
    localStorage.setItem('bookingData', JSON.stringify(tailorData));
    setCurrentView('booking');
  };

  const handleBackFromBooking = () => {
    setBookingData(null);
    // Clear bookingData from localStorage
    localStorage.removeItem('bookingData');
    setCurrentView('tailors');
  };

  // If user is not logged in, force login view (unless on signup)
  let viewToRender = !user && currentView !== 'signup' ? 'login' : currentView;
  
  // If booking view is requested but bookingData is missing, redirect to tailors
  if (viewToRender === 'booking' && !bookingData) {
    viewToRender = 'tailors';
    // Clear the invalid booking view from localStorage
    if (user) {
      localStorage.setItem('currentView', 'tailors');
    }
  }

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
          onNavigateToTailors={handleNavigateToTailors}
          onNavigateToOrdersPerDay={handleNavigateToOrdersPerDay}
          onNavigateToOrderDetails={handleNavigateToOrderDetails}
          onNavigateToMyOrders={handleNavigateToMyOrders}
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
      ) : viewToRender === 'tailors' ? (
        <TailorsListPage
          user={user}
          onBack={handleNavigateToDashboard}
          onNavigateToBooking={handleNavigateToBooking}
        />
      ) : viewToRender === 'booking' && bookingData ? (
        <BookingPage
          tailorName={bookingData.name}
          tailorServices={bookingData.services}
          tailoringCategories={bookingData.tailoringCategories}
          tailorItemPrices={bookingData.tailorItemPrices}
          businessId={bookingData.businessId}
          user={user}
          onBack={handleBackFromBooking}
        />
      ) : viewToRender === 'ordersPerDay' ? (
        <OrdersPerDay
          user={user}
          businessId={user?.businessId}
          onBack={handleNavigateToDashboard}
          onNavigateToOrderDetailsPerDay={handleNavigateToOrderDetailsPerDay}
        />
      ) : viewToRender === 'orderDetails' && selectedOrderId ? (
        <OrderDetails
          orderId={selectedOrderId}
          user={user}
          onBack={handleBackFromOrderDetails}
        />
      ) : viewToRender === 'orderDetailsPerDay' && orderDetailsPerDayData ? (
        <OrderDetailsPerDay
          businessId={orderDetailsPerDayData.businessId}
          date={orderDetailsPerDayData.date}
          user={user}
          onBack={handleBackFromOrderDetailsPerDay}
        />
      ) : viewToRender === 'myOrders' ? (
        <MyOrders
          user={user}
          onBack={handleBackFromMyOrders}
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
