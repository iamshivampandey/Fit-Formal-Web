import { useState } from 'react';
import RoleSelection from './RoleSelection';
import SellerTypeSelection from './SellerTypeSelection';
import SignupForm from './SignupForm';
import BusinessInfoForm from './BusinessInfoForm';

const MultiStepSignup = ({ 
  onBackToLogin,
  onSignupComplete,
  onShowToast
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSellerType, setSelectedSellerType] = useState(null);
  const [signupFormData, setSignupFormData] = useState(null);
  const [businessInfoData, setBusinessInfoData] = useState(null);

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
    
    if (onSignupComplete) {
      await onSignupComplete(completeData);
    }
  };

  return (
    <>
      {currentStep === 1 && (
        <RoleSelection 
          onRoleSelect={handleRoleSelect}
          onBackToLogin={onBackToLogin}
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

