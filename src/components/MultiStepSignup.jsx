import { useState } from 'react';
import RoleSelection from './RoleSelection';
import SellerTypeSelection from './SellerTypeSelection';
import SignupForm from './SignupForm';

const MultiStepSignup = ({ 
  onBackToLogin,
  onSignupComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSellerType, setSelectedSellerType] = useState(null);

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

  const handleSignupSuccess = (data) => {
    // Include the selected role in the signup data
    const finalRole = selectedRole === 'seller' ? selectedSellerType : selectedRole;
    const signupData = {
      ...data,
      role: finalRole
    };
    
    if (onSignupComplete) {
      onSignupComplete(signupData);
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
          onSignup={handleSignupSuccess}
          onBackToLogin={onBackToLogin}
          selectedRole={selectedRole === 'seller' ? selectedSellerType : selectedRole}
        />
      )}
    </>
  );
};

export default MultiStepSignup;

