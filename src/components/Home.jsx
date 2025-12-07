import CustomerHome from './CustomerHome';
import SellerHome from './SellerHome';

const Home = ({ user, onLogout, onNavigateToProducts, onNavigateToProfile, onNavigateToTailors, onNavigateToOrdersPerDay }) => {
  // Determine which home screen to show based on role
  // roleId 2 = Customer
  // roleId 3 = Seller
  // roleId 4 = Tailor
  // roleId 5 = Taylorseller
  
  console.log('🏠 Home - User:', user);
  console.log('🏠 Home - RoleId:', user?.roleId, '| RoleName:', user?.roleName);
  
  const getRoleId = () => {
    // Primary: Check if user has roleId directly
    if (user?.roleId) {
      return user.roleId;
    }
    
    // Secondary: Check roles array (in case it's passed separately)
    if (user?.roles && user.roles.length > 0) {
      return user.roles[0].id;
    }
    
    // Fallback: Map roleName to roleId
    if (user?.roleName) {
      const roleMap = {
        'Customer': 2,
        'Seller': 3,
        'Tailor': 4,
        'Taylorseller': 5
      };
      return roleMap[user.roleName] || 3; // Default to Seller
    }
    
    // Last resort: Default to Seller
    console.warn('⚠️ No role information found, defaulting to Seller');
    return 3;
  };

  const roleId = getRoleId();
  const homeType = roleId === 2 ? 'CustomerHome' : 'SellerHome';
  
  console.log('🎯 Final roleId:', roleId, '→ Showing:', homeType);

  // Show CustomerHome for roleId 2 (Customer)
  // Show SellerHome for roleId 3, 4, 5 (Seller, Tailor, Taylorseller)
  if (roleId === 2) {
    return <CustomerHome user={user} onLogout={onLogout} onNavigateToProfile={onNavigateToProfile} onNavigateToTailors={onNavigateToTailors} />;
  }

  return <SellerHome user={user} onLogout={onLogout} onNavigateToProducts={onNavigateToProducts} onNavigateToProfile={onNavigateToProfile} onNavigateToOrdersPerDay={onNavigateToOrdersPerDay} />;
};

export default Home;
