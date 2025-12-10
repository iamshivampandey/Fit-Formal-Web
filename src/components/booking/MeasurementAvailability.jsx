import React, { useState } from 'react';

const MeasurementAvailability = ({ selectedSlot, bookingDate, onConfirm, onBack }) => {
  const [selectedOption, setSelectedOption] = useState('exact');

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
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#654321',
            color: '#ffffff',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7d5a2e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#654321';
          }}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default MeasurementAvailability;


