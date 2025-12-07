import React from 'react';
import './SlotItem.css';

const SlotItem = ({ slot, onSelect, isSelected }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'booked':
        return 'Booked';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const isDisabled = slot.status !== 'available';

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`
        slot-item
        slot-item-${slot.status}
        ${isDisabled ? 'slot-item-disabled' : ''}
        ${isSelected ? 'slot-item-selected' : ''}
      `}
    >
      <div className="slot-item-header">
        <span className="slot-item-time">{slot.time}</span>
        <span className={`slot-item-badge slot-item-badge-${slot.status}`}>
          {getStatusText(slot.status)}
        </span>
      </div>
      {slot.status === 'booked' && (
        <p className="slot-item-remaining slot-item-remaining-booked">Fully booked</p>
      )}
      {slot.status === 'pending' && (
        <p className="slot-item-remaining slot-item-remaining-pending">Pending confirmation</p>
      )}
    </button>
  );
};

export default SlotItem;

