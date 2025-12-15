import React, { useState } from 'react';

const MeasurementAvailability = ({ selectedSlot, bookingDate, onConfirm, onBack, isLoading = false }) => {

  // Get today's date for Booking Date
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Calculate measurement date (tomorrow - today + 1 day)
  const getMeasurementDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const measurementDate = new Date(today);
    measurementDate.setDate(today.getDate() + 1);
    return measurementDate;
  };

  const todayDate = getTodayDate();
  const measurementDate = getMeasurementDate();
  
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format measurement date with time slot
  const formatMeasurementDateWithTime = () => {
    if (!measurementDate || !selectedSlot?.time) return '';
    const dateStr = formatDate(measurementDate);
    return `${dateStr} - ${selectedSlot.time}`;
  };


  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ 
        backgroundColor: '#F2F2F7', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '1.5rem',
        border: '1px solid #E5E5EA'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#1c1c1c', marginBottom: '0.5rem' }}>
          <strong style={{ color: '#654321' }}>Booking Date:</strong> <span style={{ color: '#8E8E93' }}>{formatDate(todayDate)}</span>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#1c1c1c', marginBottom: '0.5rem' }}>
          <strong style={{ color: '#654321' }}>Measurement Date:</strong> <span style={{ color: '#8E8E93' }}>{formatMeasurementDateWithTime()}</span>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#1c1c1c' }}>
          <strong style={{ color: '#654321' }}>Stitching Date:</strong> <span style={{ color: '#8E8E93' }}>{formatDate(bookingDate)}</span>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#1c1c1c' }}>
          <strong style={{ color: '#654321' }}>Delivery By:</strong> <span style={{ color: '#8E8E93' }}>{formatDate(new Date(bookingDate.getTime() + 5 * 24 * 60 * 60 * 1000))}</span>
        </p>
      </div>

      {/* Options */}


      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '2px solid #c0c0c0',
            color: '#666',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f8f8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          Back
        </button>
        <button
          onClick={() => {
            if (isLoading) return;
            
            // Get measurement date (tomorrow)
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            // Parse time slot and set the time on measurement date
            // Time format is like "4pm-6pm", we'll use the start time (4pm)
            let hour = 14; // Default to 2pm
            if (selectedSlot?.time) {
              const timeStr = selectedSlot.time.split('-')[0].trim(); // Get "4pm"
              const isPM = timeStr.toLowerCase().includes('pm');
              hour = parseInt(timeStr.replace(/[^0-9]/g, ''));
              
              if (isPM && hour !== 12) {
                hour += 12; // Convert to 24-hour format
              } else if (!isPM && hour === 12) {
                hour = 0; // 12am = 0:00
              }
            }
            
            // Create measurement date with correct time
            // Format as YYYY-MM-DDTHH:mm:ss to preserve date, then convert to Date
            const measurementYear = tomorrow.getFullYear();
            const measurementMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const measurementDay = String(tomorrow.getDate()).padStart(2, '0');
            const measurementHour = String(hour).padStart(2, '0');
            const measurementDateStr = `${measurementYear}-${measurementMonth}-${measurementDay}T${measurementHour}:00:00`;
            const measurementDateObj = new Date(measurementDateStr);
            
            // Get stitching date (bookingDate) - format to preserve date
            const stitchingYear = bookingDate.getFullYear();
            const stitchingMonth = String(bookingDate.getMonth() + 1).padStart(2, '0');
            const stitchingDay = String(bookingDate.getDate()).padStart(2, '0');
            const stitchingDateStr = `${stitchingYear}-${stitchingMonth}-${stitchingDay}T00:00:00`;
            const stitchingDateObj = new Date(stitchingDateStr);
            
            // Get booking date (today) with current time
            const bookingDateObj = new Date(); // Current date/time
            
            onConfirm({
              measurementDate: measurementDateObj,
              stitchingDate: stitchingDateObj,
              bookingDate: bookingDateObj,
              selectedSlot: selectedSlot // Pass the selected slot information
            });
          }}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: isLoading ? '#9d7d5e' : '#654321',
            color: '#ffffff',
            fontWeight: 600,
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#7d5a2e';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#654321';
            }
          }}
        >
          {isLoading ? 'Creating Order...' : 'Confirm Selection'}
        </button>
      </div>
    </div>
  );
};

export default MeasurementAvailability;


