import React, { useState } from 'react';
import BookingPage from './BookingPage';
import './TailorProfile.css';

const TailorProfile = ({ tailor, onBack, user, onNavigateToBooking }) => {
  const [showBookingPage, setShowBookingPage] = useState(false);

  // Helper function to parse serviceTypes
  const parseServiceTypes = (serviceTypes) => {
    if (!serviceTypes) return ['Custom Tailoring', 'Alterations', 'Formal Suits', 'Wedding Attire'];
    
    // If it's already an array, return it
    if (Array.isArray(serviceTypes)) {
      return serviceTypes;
    }
    
    // If it's a string, try to parse it
    if (typeof serviceTypes === 'string') {
      try {
        // Handle HTML entities like &quot;
        const decoded = serviceTypes.replace(/&quot;/g, '"');
        const parsed = JSON.parse(decoded);
        return Array.isArray(parsed) ? parsed : [serviceTypes];
      } catch (e) {
        // If parsing fails, treat as comma-separated string
        return serviceTypes.split(',').map(s => s.trim()).filter(s => s);
      }
    }
    
    return ['Custom Tailoring', 'Alterations', 'Formal Suits', 'Wedding Attire'];
  };

  // Get tailor data from prop
  const getTailorData = () => {
    const dataSource = tailor;
    
    return {
      name: dataSource?.businessName || `${dataSource?.firstName || ''} ${dataSource?.lastName || ''}`.trim() || 'Tailor',
      ownerName: dataSource?.ownerName,
      rating: 4.5, // Default - can be fetched from API
      reviews: 120, // Default - can be fetched from API
      experience: dataSource?.yearsOfExperience || dataSource?.businessInfo?.yearsOfExperience || 
                  dataSource?.experience || dataSource?.businessInfo?.experience || 'Not specified',
      city: dataSource?.workingCity || dataSource?.businessInfo?.workingCity || 
            dataSource?.city || dataSource?.businessInfo?.city || 'City not specified',
      services: parseServiceTypes(dataSource?.serviceTypes),
      workingHours: dataSource?.openingTime && dataSource?.closingTime 
                    ? `${dataSource.openingTime} - ${dataSource.closingTime}`
                    : '9:00 AM - 7:00 PM',
      travelArea: dataSource?.travelArea || 'Within 10 km',
      cancellationPolicy: 'Free cancellation up to 24 hours before appointment',
      businessLogo: dataSource?.businessLogo,
      businessDescription: dataSource?.businessDescription,
      isActive: dataSource?.isActive
    };
  };

  const tailorData = getTailorData();

  const dummyReviews = [
    { id: 1, name: 'Amit Kumar', rating: 5, comment: 'Excellent work! Very professional.' },
    { id: 2, name: 'Priya Sharma', rating: 4, comment: 'Good quality stitching, on-time delivery.' },
    { id: 3, name: 'Rahul Singh', rating: 5, comment: 'Highly recommended for formal wear.' }
  ];

  const handleBookNow = () => {
    // Navigate to booking page (full page for clothes selection)
    // DatePicker will open in a popup after clothes are selected
    if (onNavigateToBooking) {
      // Parse tailoringCategories from tailor object
      let tailoringCategories = tailor?.tailoringCategories;
      if (typeof tailoringCategories === 'string') {
        try {
          const decoded = tailoringCategories.replace(/&quot;/g, '"');
          tailoringCategories = JSON.parse(decoded);
        } catch (e) {
          console.warn('Failed to parse tailoringCategories:', e);
          tailoringCategories = [];
        }
      }
      
      onNavigateToBooking({
        businessId: tailor?.businessId || tailor?.userId || tailor?.id,
        name: tailorData.name,
        services: tailorData.services,
        tailoringCategories: tailoringCategories || [],
        user: user
      });
    } else {
      setShowBookingPage(true);
    }
  };

  return (
    <div className="tailor-profile-page">
      {/* Header */}
      <header className="tailor-profile-header">
        <div className="tailor-profile-header-content">
          <div className="tailor-profile-header-inner">
            {onBack && (
              <button
                onClick={onBack}
                className="tailor-profile-back-button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            {/* Business Logo */}
            {tailorData.businessLogo && (
              <div className="tailor-profile-logo-container">
                <img 
                  src={tailorData.businessLogo} 
                  alt={`${tailorData.name} logo`}
                  className="tailor-profile-logo"
                  onError={(e) => {
                    console.error('Failed to load business logo');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="tailor-profile-title-section">
              <h1 className="tailor-profile-name">{tailorData.name}</h1>
              {tailorData.ownerName && tailorData.ownerName !== tailorData.name && (
                <p className="tailor-profile-owner">by {tailorData.ownerName}</p>
              )}
              <div className="tailor-profile-meta">
                <div className="tailor-profile-rating">
                  <div className="tailor-profile-rating-stars">
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
                  <span className="tailor-profile-rating-text">{tailorData.rating}</span>
                  <span className="tailor-profile-rating-reviews">({tailorData.reviews} reviews)</span>
                </div>
                <span className="tailor-profile-meta-separator">•</span>
                <span className="tailor-profile-city">{tailorData.city}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tailor-profile-main">
        <div className="tailor-profile-grid">
          {/* Main Content */}
          <div className="tailor-profile-content">
            {/* Business Description */}
            {tailorData.businessDescription && (
              <div className="tailor-profile-card">
                <h2 className="tailor-profile-card-title">About</h2>
                <p className="tailor-profile-description">{tailorData.businessDescription}</p>
              </div>
            )}

            {/* Services Offered */}
            <div className="tailor-profile-card">
              <h2 className="tailor-profile-card-title">Services Offered</h2>
              <div className="tailor-profile-services">
                {Array.isArray(tailorData.services) ? (
                  tailorData.services.map((service, index) => (
                    <span key={index} className="tailor-profile-service-tag">
                      {typeof service === 'string' ? service : service.name || service}
                    </span>
                  ))
                ) : (
                  <span className="tailor-profile-service-tag">
                    {tailorData.services}
                  </span>
                )}
              </div>
            </div>

            {/* Gallery / Portfolio */}
            <div className="tailor-profile-card">
              <h2 className="tailor-profile-card-title">Gallery / Portfolio</h2>
              <div className="tailor-profile-gallery">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="tailor-profile-gallery-item">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="tailor-profile-card">
              <h2 className="tailor-profile-card-title">Reviews</h2>
              <div className="tailor-profile-reviews">
                {dummyReviews.map((review) => (
                  <div key={review.id} className="tailor-profile-review-item">
                    <div className="tailor-profile-review-header">
                      <h4 className="tailor-profile-review-name">{review.name}</h4>
                      <div className="tailor-profile-review-stars">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={i < review.rating ? '#ffa500' : '#e0e0e0'}
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="tailor-profile-review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="tailor-profile-sidebar">
            {/* Experience */}
            <div className="tailor-profile-card">
              <h3 className="tailor-profile-card-subtitle">Experience</h3>
              <p className="tailor-profile-info-text">
                {tailorData.experience}
                {typeof tailorData.experience === 'number' ? ' years' : ''}
              </p>
            </div>

            {/* Cancellation Policy */}
            <div className="tailor-profile-card">
              <h3 className="tailor-profile-card-subtitle">Cancellation Policy</h3>
              <p className="tailor-profile-info-text tailor-profile-info-text-small">{tailorData.cancellationPolicy}</p>
            </div>

            {/* Measurement History */}
            <div className="tailor-profile-card">
              <h3 className="tailor-profile-card-subtitle">Measurement History</h3>
              <p className="tailor-profile-info-text tailor-profile-info-text-small">No previous measurements recorded</p>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Book Now Button */}
      <div className="tailor-profile-book-button-container">
        <div className="tailor-profile-book-button-wrapper">
          <button
            onClick={handleBookNow}
            className="tailor-profile-book-button"
          >
            BOOK NOW
          </button>
        </div>
      </div>

      {/* Booking Page */}
      {showBookingPage && (
        <BookingPage 
          onBack={() => setShowBookingPage(false)}
          tailorName={tailorData.name}
          tailorServices={tailorData.services}
          businessId={tailor?.businessId || tailor?.userId || tailor?.id}
          user={user}
        />
      )}
    </div>
  );
};

export default TailorProfile;

