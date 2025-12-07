import React, { useState } from 'react';
import ClothesSelection from './ClothesSelection';
import DatePicker from './DatePicker';
import SlotList from './SlotList';
import MeasurementAvailability from './MeasurementAvailability';
import BookingSuccess from './BookingSuccess';
import './BookingModal.css';

const BookingModal = ({ onClose, tailorName, tailorServices, businessId, user }) => {
  const [step, setStep] = useState(0); // 0: ClothesSelection, 1: DatePicker, 2: MeasurementAvailability
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClothesNext = (clothes) => {
    setSelectedClothes(clothes);
    setStep(1); // Move to date picker
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Automatically move to measurement slots page when date is selected
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleMeasurementConfirm = () => {
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <div className="booking-modal-overlay">
        <div className="booking-modal-container">
          {/* Header */}
          <div className="booking-modal-header">
            <h2 className="booking-modal-title">
              {step === 0 ? 'Select Clothes' : step === 1 ? 'Pick an available stitching date' : 'Select Measurement Slot'}
            </h2>
            <button
              onClick={onClose}
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
            {step === 0 && (
              <ClothesSelection
                tailorServices={tailorServices}
                tailorName={tailorName}
                onNext={handleClothesNext}
                onBack={onClose}
              />
            )}

            {step === 1 && (
              <DatePicker 
                onDateSelect={handleDateSelect} 
                selectedDate={selectedDate}
                businessId={businessId}
                user={user}
                onBack={() => setStep(0)}
              />
            )}

            {step === 2 && !selectedSlot && (
              <SlotList
                date={selectedDate}
                onSlotSelect={handleSlotSelect}
                selectedSlot={selectedSlot}
              />
            )}

            {step === 2 && selectedSlot && (
              <MeasurementAvailability
                selectedSlot={selectedSlot}
                bookingDate={selectedDate}
                selectedClothes={selectedClothes}
                onConfirm={handleMeasurementConfirm}
                onBack={() => {
                  setSelectedSlot(null);
                  setStep(1);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Booking Success */}
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

export default BookingModal;

