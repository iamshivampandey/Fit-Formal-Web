import React, { useState, useEffect } from 'react';
import ClothesSelection from './ClothesSelection';
import DatePicker from './DatePicker';
import SlotList from './SlotList';
import MeasurementAvailability from './MeasurementAvailability';
import BookingSuccess from './BookingSuccess';
import './BookingPage.css';
import './BookingModal.css';

const BookingPage = ({ tailorName, tailorServices, tailoringCategories, tailorItemPrices, businessId, user, onBack }) => {
  const [showDateModal, setShowDateModal] = useState(false); // Modal for date picker and slots
  const [modalStep, setModalStep] = useState(1); // 1: DatePicker, 2: SlotList/MeasurementAvailability
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('📦 BookingPage - Received props:', {
      tailorName,
      tailorServices,
      tailoringCategories,
      tailorItemPrices,
      businessId
    });
  }, [tailorName, tailorServices, tailoringCategories, tailorItemPrices, businessId]);

  const handleClothesNext = (clothes) => {
    setSelectedClothes(clothes);
    setShowDateModal(true); // Open modal for date selection
    setModalStep(1); // Start with date picker
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Automatically move to measurement slots page when date is selected
    setModalStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleMeasurementConfirm = () => {
    setShowSuccess(true);
    setShowDateModal(false); // Close date modal
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (onBack) {
      onBack();
    }
  };

  const handleCloseDateModal = () => {
    setShowDateModal(false);
    setModalStep(1);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const getModalTitle = () => {
    if (modalStep === 1) {
      return 'Pick an available stitching date';
    } else if (modalStep === 2 && !selectedSlot) {
      return 'Select Measurement Slot';
    } else {
      return 'Confirm Measurement Availability';
    }
  };

  return (
    <>
      <div className="booking-page">
        {/* Header */}
        <header className="booking-page-header">
          <div className="booking-page-header-content">
            {onBack && (
              <button
                onClick={onBack}
                className="booking-page-back-button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <h1 className="booking-page-title">Select Clothes</h1>
            <div className="header-spacer"></div>
          </div>
        </header>

        {/* Main Content - Clothes Selection (Full Page) */}
        <main className="booking-page-main">
          <div className="booking-page-container">
            <ClothesSelection
              tailorServices={tailorServices}
              tailorName={tailorName}
              tailoringCategories={tailoringCategories}
              tailorItemPrices={tailorItemPrices}
              onNext={handleClothesNext}
              onBack={onBack}
            />
          </div>
        </main>
      </div>

      {/* Date Picker & Slot Selection Modal */}
      {showDateModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-container">
            {/* Header */}
            <div className="booking-modal-header">
              <h2 className="booking-modal-title">{getModalTitle()}</h2>
              <button
                onClick={handleCloseDateModal}
                className="booking-modal-close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="booking-modal-content">
              {modalStep === 1 && (
                <DatePicker 
                  onDateSelect={handleDateSelect} 
                  selectedDate={selectedDate}
                  businessId={businessId}
                  user={user}
                  onBack={handleCloseDateModal}
                />
              )}

              {modalStep === 2 && !selectedSlot && (
                <SlotList
                  date={selectedDate}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                />
              )}

              {modalStep === 2 && selectedSlot && (
                <MeasurementAvailability
                  selectedSlot={selectedSlot}
                  bookingDate={selectedDate}
                  selectedClothes={selectedClothes}
                  onConfirm={handleMeasurementConfirm}
                  onBack={() => {
                    setSelectedSlot(null);
                    setModalStep(1);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {showSuccess && (
        <BookingSuccess
          bookingData={{
            id: 'BK123456',
            date: selectedDate,
            time: selectedSlot?.time,
            tailorName: tailorName || 'Tailor'
          }}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
};

export default BookingPage;

