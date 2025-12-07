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

  const options = [
    { id: 'exact', label: 'Exact slot selected', description: selectedSlot?.time },
    { id: 'flexible', label: 'Flexible window', description: 'I can adjust timing within the slot' },
  ];

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

      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1c1c1c', marginBottom: '0.5rem' }}>
        Measurement ke liye aap kab available ho?
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' }}>
        Please confirm your measurement slot preference
      </p>

      {/* Options */}
      <div style={{ marginBottom: '1.5rem' }}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${selectedOption === option.id ? '#654321' : '#e0e0e0'}`,
              backgroundColor: selectedOption === option.id ? '#f5f0e8' : '#ffffff',
              textAlign: 'left',
              marginBottom: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              if (selectedOption !== option.id) {
                e.currentTarget.style.borderColor = '#c0c0c0';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedOption !== option.id) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <div>
              <p style={{ fontWeight: 600, color: '#1c1c1c', marginBottom: '0.25rem' }}>
                {option.label}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                {option.description}
              </p>
            </div>
            {selectedOption === option.id && (
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#654321',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="white">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

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


