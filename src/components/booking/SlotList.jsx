import React from 'react';
import SlotItem from './SlotItem';
import './SlotList.css';

const SlotList = ({ date, onSlotSelect, selectedSlot }) => {
  // Generate 7 slots from 8 AM to 10 PM with 2-hour intervals
  // 8-10, 10-12, 12-2, 2-4, 4-6, 6-8, 8-10
  const generateSlots = () => {
    const slots = [];
    const startHour = 8;
    const slotDuration = 2; // 2 hours per slot
    
    for (let i = 0; i < 7; i++) {
      const startTime = startHour + (i * slotDuration);
      const endTime = startTime + slotDuration;
      
      // Format time in simple format like "8am-10am"
      const formatTime = (hour) => {
        if (hour === 0) return '12am';
        if (hour < 12) return `${hour}am`;
        if (hour === 12) return '12pm';
        return `${hour - 12}pm`;
      };
      
      const timeRange = `${formatTime(startTime)}-${formatTime(endTime)}`;
      
      slots.push({
        id: i + 1,
        time: timeRange,
        startTime: startTime,
        endTime: endTime,
        status: 'available', // Default to available, can be updated from API
        remaining: 2 // Default remaining slots
      });
    }
    
    return slots;
  };

  const slots = generateSlots();

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate measurement date (tomorrow - today + 1 day)
  const getMeasurementDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const measurementDate = new Date(today);
    measurementDate.setDate(today.getDate() + 1);
    return measurementDate;
  };

  const measurementDate = getMeasurementDate();

  return (
    <div className="slot-list-container">
      {measurementDate && (
        <div style={{ 
          backgroundColor: '#F2F2F7', 
          padding: '0.875rem 1rem', 
          borderRadius: '8px', 
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          color: '#1c1c1c',
          border: '1px solid #E5E5EA'
        }}>
          <strong style={{ color: '#654321' }}>Measurement Date:</strong> <span style={{ color: '#8E8E93' }}>{formatDate(measurementDate)}</span>
        </div>
      )}
      <h3 className="slot-list-title">Select Measurement Slot</h3>
      <p className="slot-list-subtitle">
        Choose a 2-hour slot for your measurement appointment
      </p>
      <div className="slot-list-grid">
        {slots.map((slot) => (
          <SlotItem
            key={slot.id}
            slot={slot}
            onSelect={() => onSlotSelect(slot)}
            isSelected={selectedSlot?.id === slot.id}
          />
        ))}
      </div>
    </div>
  );
};

export default SlotList;

