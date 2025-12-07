import { useState, useEffect } from 'react';
import './TailorsListPage.css';
import TailorProfile from './booking/TailorProfile';

const TailorsListPage = ({ user, onBack, onNavigateToBooking }) => {
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Restore selectedTailor from localStorage to persist across refreshes
  const [selectedTailor, setSelectedTailor] = useState(() => {
    const savedTailor = localStorage.getItem('selectedTailor');
    if (savedTailor) {
      try {
        return JSON.parse(savedTailor);
      } catch (e) {
        console.error('Error parsing saved tailor:', e);
        localStorage.removeItem('selectedTailor');
        return null;
      }
    }
    return null;
  });
  const [loadingBusinessId, setLoadingBusinessId] = useState(null); // Track which tailor's API is loading

  useEffect(() => {
    fetchTailors();
  }, []);

  const fetchTailors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching tailors from /api/tailors');
      
      // Prepare headers with authorization token
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token is available
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
        console.log('🔑 Adding authorization token to request');
      } else {
        console.warn('⚠️ No token found in user object');
      }
      
      const response = await fetch('/api/tailors', {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch tailors: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Tailors data received:', data);

      // Check if response indicates an error
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch tailors');
      }

      // Handle the new API response structure: { success: true, message: "...", count: 3, data: [...] }
      const tailorsData = data.data || data.tailors || [];
      setTailors(tailorsData);
    } catch (err) {
      console.error('❌ Error fetching tailors:', err);
      const errorMessage = err.message || 'Failed to load tailors. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTailor = async (tailor) => {
    // Get businessId from tailor object - prioritize businessId field
    const businessId = tailor?.businessId || tailor?.userId || tailor?.id;
    
    if (!businessId) {
      console.error('❌ No businessId found for tailor:', tailor);
      alert('Unable to proceed with booking. Business ID not found.');
      return;
    }

    // Log which field is being used
    if (tailor?.businessId) {
      console.log('✅ Using businessId from tailor object:', tailor.businessId);
    } else if (tailor?.userId) {
      console.log('⚠️ Using userId as fallback:', tailor.userId);
    } else if (tailor?.id) {
      console.log('⚠️ Using id as fallback:', tailor.id);
    }

    try {
      setLoadingBusinessId(businessId);
      console.log('📞 Calling API: GET /api/business/tailor/' + businessId);
      console.log('📋 Tailor object:', tailor);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if available
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      } else {
        // Try localStorage as fallback
        const authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      }
      const response = await fetch(`/api/tailor/${businessId}`, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch tailor business data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Tailor business data received:', data);

      // Check if response indicates an error
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch tailor business data');
      }

      // Merge API response data with tailor object
      const tailorWithBusinessData = {
        ...tailor,
        ...data.data, // Merge all business data fields
        tailoringCategories: data.data?.tailoringCategories || tailor?.tailoringCategories
      };

      // API call successful, proceed to show tailor profile
      console.log('Selected tailor with business data:', tailorWithBusinessData);
      setSelectedTailor(tailorWithBusinessData);
      // Save to localStorage to persist across refreshes
      localStorage.setItem('selectedTailor', JSON.stringify(tailorWithBusinessData));
    } catch (err) {
      console.error('❌ Error fetching tailor business data:', err);
      alert(err.message || 'Failed to load business information. Please try again.');
    } finally {
      setLoadingBusinessId(null);
    }
  };

  const handleBackFromProfile = () => {
    setSelectedTailor(null);
    // Clear persisted tailor selection when explicitly going back to list
    localStorage.removeItem('selectedTailor');
  };

  // Save selectedTailor to localStorage whenever it changes
  useEffect(() => {
    if (selectedTailor) {
      localStorage.setItem('selectedTailor', JSON.stringify(selectedTailor));
    } else {
      // Only remove if we're explicitly clearing (not on initial mount)
      // This is handled by handleBackFromProfile
    }
  }, [selectedTailor]);

  // Filter tailors based on search query
  const filteredTailors = tailors.filter(tailor => {
    const searchLower = searchQuery.toLowerCase();
    const businessName = (tailor.businessName || '').toLowerCase();
    const firstName = (tailor.firstName || '').toLowerCase();
    const lastName = (tailor.lastName || '').toLowerCase();
    const ownerName = (tailor.ownerName || '').toLowerCase();
    const city = (tailor.workingCity || tailor.businessInfo?.workingCity || 
                  tailor.city || tailor.businessInfo?.city || '').toLowerCase();
    
    return businessName.includes(searchLower) || 
           firstName.includes(searchLower) || 
           lastName.includes(searchLower) ||
           ownerName.includes(searchLower) ||
           city.includes(searchLower);
  });

  // If a tailor is selected, show their profile
  if (selectedTailor) {
    return (
      <TailorProfile 
        tailor={selectedTailor}
        onBack={handleBackFromProfile}
        user={user}
        onNavigateToBooking={onNavigateToBooking}
      />
    );
  }

  return (
    <div className="tailors-list-page">
      {/* Header */}
      <header className="tailors-page-header">
        <div className="tailors-header-content">
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="tailors-page-title">Find Tailors</h1>
          <div className="header-spacer"></div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search for tailors, business names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="tailors-page-main">
        <div className="tailors-container">
          {loading ? (
            <div className="tailors-loading">
              <div className="loading-spinner"></div>
              <p>Loading tailors...</p>
            </div>
          ) : error ? (
            <div className="tailors-error">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
              <button className="retry-button" onClick={fetchTailors}>
                Try Again
              </button>
            </div>
          ) : filteredTailors.length === 0 ? (
            <div className="tailors-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              <p>{searchQuery ? 'No tailors found matching your search' : 'No tailors available at the moment'}</p>
            </div>
          ) : (
            <>
              <div className="tailors-count">
                {filteredTailors.length} {filteredTailors.length === 1 ? 'tailor' : 'tailors'} found
              </div>
              <div className="tailors-grid">
                {filteredTailors.map((tailor) => (
                  <div key={tailor.userId || tailor.id} className="tailor-card">
                    {/* Business Logo/Image */}
                    <div className="tailor-image-container">
                      {tailor.businessLogo ? (
                        <img 
                          src={tailor.businessLogo} 
                          alt={tailor.businessName || 'Tailor'} 
                          className="tailor-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="tailor-image-placeholder" style={{ display: tailor.businessLogo ? 'none' : 'flex' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                      </div>
                      {tailor.isActive && (
                        <div className="tailor-badge">Active</div>
                      )}
                    </div>

                    {/* Tailor Info */}
                    <div className="tailor-card-content">
                      <div className="tailor-header">
                        <h3 className="tailor-name">
                          {tailor.businessName || `${tailor.firstName || ''} ${tailor.lastName || ''}`.trim() || 'Tailor'}
                        </h3>
                        {tailor.ownerName && tailor.ownerName !== `${tailor.firstName} ${tailor.lastName}`.trim() && (
                          <p className="tailor-owner">by {tailor.ownerName}</p>
                        )}
                      </div>

                      {/* Rating and Reviews */}
                      <div className="tailor-rating">
                        <div className="rating-stars">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <span className="rating-text">4.5</span>
                        <span className="rating-separator">•</span>
                        <span className="rating-reviews">50+ reviews</span>
                      </div>

                      {/* Location and Experience Info */}
                      <div className="tailor-info-section">
                        {/* City */}
                        <div className="info-item">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>
                            {tailor.workingCity || tailor.businessInfo?.workingCity || 
                             tailor.city || tailor.businessInfo?.city ||
                             (tailor.shopAddress || tailor.address ? 
                              (tailor.shopAddress || tailor.address).split(',').pop().trim() : 
                              'City not specified')}
                          </span>
                        </div>
                        
                        {/* Experience */}
                        <div className="info-item">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span>
                            {tailor.yearsOfExperience || tailor.businessInfo?.yearsOfExperience || 
                             tailor.experience || tailor.businessInfo?.experience || 
                             'Not specified'}
                            {(tailor.yearsOfExperience || tailor.businessInfo?.yearsOfExperience || 
                              tailor.experience || tailor.businessInfo?.experience) && ' years experience'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        className="tailor-book-button"
                        onClick={() => handleSelectTailor(tailor)}
                        disabled={loadingBusinessId === (tailor?.businessId || tailor?.userId || tailor?.id)}
                      >
                        {loadingBusinessId === (tailor?.businessId || tailor?.userId || tailor?.id) 
                          ? 'Loading...' 
                          : 'Book Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TailorsListPage;

