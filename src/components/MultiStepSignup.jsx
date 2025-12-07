import { useState, useEffect } from 'react';
import RoleSelection from './RoleSelection';
import SellerTypeSelection from './SellerTypeSelection';
import SignupForm from './SignupForm';
import BusinessInfoForm from './BusinessInfoForm';

const MultiStepSignup = ({ 
  onBackToLogin,
  onSignupComplete,
  onShowToast
}) => {
  // Initialize state from localStorage to persist across page refreshes
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('signupStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [selectedRole, setSelectedRole] = useState(() => {
    const savedRole = localStorage.getItem('selectedRole');
    return savedRole || null;
  });
  const [selectedSellerType, setSelectedSellerType] = useState(() => {
    const savedType = localStorage.getItem('selectedSellerType');
    return savedType || null;
  });
  const [signupFormData, setSignupFormData] = useState(() => {
    const savedData = localStorage.getItem('signupFormData');
    return savedData ? JSON.parse(savedData) : null;
  });
  const [businessInfoData, setBusinessInfoData] = useState(() => {
    const savedData = localStorage.getItem('businessInfoData');
    return savedData ? JSON.parse(savedData) : null;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('signupStep', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (selectedRole) {
      localStorage.setItem('selectedRole', selectedRole);
    } else {
      localStorage.removeItem('selectedRole');
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedSellerType) {
      localStorage.setItem('selectedSellerType', selectedSellerType);
    } else {
      localStorage.removeItem('selectedSellerType');
    }
  }, [selectedSellerType]);

  useEffect(() => {
    if (signupFormData) {
      localStorage.setItem('signupFormData', JSON.stringify(signupFormData));
    } else {
      localStorage.removeItem('signupFormData');
    }
  }, [signupFormData]);

  useEffect(() => {
    if (businessInfoData) {
      localStorage.setItem('businessInfoData', JSON.stringify(businessInfoData));
    } else {
      localStorage.removeItem('businessInfoData');
    }
  }, [businessInfoData]);

  // Clear signup-related localStorage when signup is completed
  const clearSignupState = () => {
    localStorage.removeItem('signupStep');
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('selectedSellerType');
    localStorage.removeItem('signupFormData');
    localStorage.removeItem('businessInfoData');
  };

  const handleBackToLogin = () => {
    // Clear signup state when going back to login
    clearSignupState();
    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'seller') {
      // Show seller type selection
      setCurrentStep(2);
    } else {
      // Customer goes directly to signup
      setCurrentStep(3);
    }
  };

  const handleSellerTypeSelect = (type) => {
    setSelectedSellerType(type);
    setCurrentStep(3);
  };

  const handleBackFromSellerType = () => {
    setCurrentStep(1);
    setSelectedRole(null);
    setSelectedSellerType(null);
  };

  const handleSignupFormComplete = (data) => {
    // Check if user is a seller
    const isSeller = selectedRole === 'seller';
    
    if (isSeller) {
      // Store signup data and move to business info step
      setSignupFormData(data);
      setCurrentStep(4);
    } else {
      // For customers, complete signup directly
      const finalData = {
        ...data,
        role: selectedRole
      };
      
      // Clear signup state after successful signup
      clearSignupState();
      
      if (onSignupComplete) {
        onSignupComplete(finalData);
      }
    }
  };

  const handleBackFromSignup = () => {
    if (selectedRole === 'seller') {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleBackFromBusinessInfo = () => {
    setCurrentStep(3);
  };

  const handleBusinessInfoSubmit = async (businessData) => {
    console.log('📝 MultiStepSignup - Received business data:', businessData);
    console.log('👤 MultiStepSignup - Signup form data:', signupFormData);
    console.log('🎭 MultiStepSignup - Selected seller type:', selectedSellerType);
    
    // Store business info data for potential back navigation
    setBusinessInfoData(businessData);
    
    // Combine signup data with business data
    const finalRole = selectedSellerType;
    const completeData = {
      ...signupFormData,
      role: finalRole,
      businessInfo: businessData
    };
    
    console.log('📦 MultiStepSignup - Complete data being sent:', completeData);
    console.log('🏢 MultiStepSignup - Business info included?', !!completeData.businessInfo);
    
    // Clear signup state after successful signup
    clearSignupState();
    
    if (onSignupComplete) {
      await onSignupComplete(completeData);
    }
  };

  return (
    <>
      {currentStep === 1 && (
        <RoleSelection 
          onRoleSelect={handleRoleSelect}
          onBackToLogin={handleBackToLogin}
        />
      )}

      {currentStep === 2 && (
        <SellerTypeSelection 
          onSellerTypeSelect={handleSellerTypeSelect}
          onBack={handleBackFromSellerType}
        />
      )}

      {currentStep === 3 && (
        <SignupForm 
          onSignup={handleSignupFormComplete}
          onBackToLogin={handleBackFromSignup}
          selectedRole={selectedRole === 'seller' ? selectedSellerType : selectedRole}
          isSeller={selectedRole === 'seller'}
          initialData={signupFormData}
        />
      )}

      {currentStep === 4 && (
        <BusinessInfoForm
          onSubmit={handleBusinessInfoSubmit}
          onBack={handleBackFromBusinessInfo}
          sellerType={selectedSellerType}
          initialData={{ 
            ...businessInfoData, // Restore previously filled business info
            mobileNumber: businessInfoData?.mobileNumber || signupFormData?.phoneNumber || '',
            email: businessInfoData?.email || signupFormData?.email || ''
          }}
          onShowToast={onShowToast}
        />
      )}
    </>
  );
};

export default MultiStepSignup;

