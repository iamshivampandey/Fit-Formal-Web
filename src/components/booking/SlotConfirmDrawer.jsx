import React, { useState } from 'react';
import './SlotConfirmDrawer.css';

const SlotConfirmDrawer = ({ slot, onConfirm, onClose }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const handleContinue = () => {
    if (selectedMode) {
      onConfirm(selectedMode);
    }
  };

  return (
    <div className="slot-confirm-drawer-overlay">
      <div className="slot-confirm-drawer">
        {/* Header */}
        <div className="slot-confirm-drawer-header">
          <h3 className="slot-confirm-drawer-title">Confirm Slot</h3>
          <button
            onClick={onClose}
            className="slot-confirm-drawer-close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Selected Slot */}
        <div className="slot-confirm-selected-slot">
          <div className="slot-confirm-slot-info">
            <div className="slot-confirm-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="slot-confirm-slot-details">
              <p className="slot-confirm-slot-label">Selected Time</p>
              <p className="slot-confirm-slot-time">{slot?.time}</p>
            </div>
          </div>
        </div>

        {/* Estimated Travel Time */}
        <div className="slot-confirm-travel-time">
          <p className="slot-confirm-travel-label">Estimated Travel Time</p>
          <p className="slot-confirm-travel-value">15-20 minutes</p>
        </div>

        {/* Mode Selector */}
        <div className="slot-confirm-mode-section">
          <p className="slot-confirm-mode-title">Select Mode</p>
          <div className="slot-confirm-mode-options">
            <button
              onClick={() => setSelectedMode('onsite')}
              className={`slot-confirm-mode-option ${selectedMode === 'onsite' ? 'slot-confirm-mode-option-selected' : 'slot-confirm-mode-option-unselected'}`}
            >
              <div className="slot-confirm-mode-option-content">
                <div className="slot-confirm-mode-option-text">
                  <p className="slot-confirm-mode-option-name">Onsite</p>
                  <p className="slot-confirm-mode-option-desc">Tailor will visit your location</p>
                </div>
                {selectedMode === 'onsite' && (
                  <div className="slot-confirm-check">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('shop')}
              className={`slot-confirm-mode-option ${selectedMode === 'shop' ? 'slot-confirm-mode-option-selected' : 'slot-confirm-mode-option-unselected'}`}
            >
              <div className="slot-confirm-mode-option-content">
                <div className="slot-confirm-mode-option-text">
                  <p className="slot-confirm-mode-option-name">At Shop</p>
                  <p className="slot-confirm-mode-option-desc">Visit tailor's shop</p>
                </div>
                {selectedMode === 'shop' && (
                  <div className="slot-confirm-check">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Info Text */}
        <div className="slot-confirm-info-box">
          <p className="slot-confirm-info-text">
            Please ensure you're available at the selected time. You can reschedule up to 24 hours before the appointment.
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedMode}
          className={`slot-confirm-continue-button ${selectedMode ? 'slot-confirm-continue-button-enabled' : 'slot-confirm-continue-button-disabled'}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SlotConfirmDrawer;

