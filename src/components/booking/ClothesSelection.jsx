import React, { useState } from 'react';
import './ClothesSelection.css';

const ClothesSelection = ({ tailorServices, tailorName, tailoringCategories, onNext, onBack }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Default services if not provided
  const services = tailorServices || ['Custom Tailoring', 'Alterations', 'Formal Suits', 'Wedding Attire'];

  // Parse tailoringCategories if it's a string (JSON)
  const parseTailoringCategories = (categories) => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (typeof categories === 'string') {
      try {
        // Handle HTML entities
        const decoded = categories
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
        return JSON.parse(decoded);
      } catch (e) {
        console.warn('Failed to parse tailoringCategories:', e);
        return [];
      }
    }
    return [];
  };

  const availableCategories = parseTailoringCategories(tailoringCategories);

  // Map category names to service types
  const getServiceForCategory = (categoryName) => {
    const categoryLower = categoryName.toLowerCase();
    
    // Wedding Attire categories
    if (categoryLower.includes('sherwani') || 
        categoryLower.includes('kurta') || 
        categoryLower.includes('pyjama') ||
        categoryLower.includes('wedding suit') ||
        categoryLower.includes('indo-western')) {
      return 'Wedding Attire';
    }
    
    // Formal Suits categories
    if (categoryLower.includes('suit') && (categoryLower.includes('2-piece') || categoryLower.includes('3-piece'))) {
      return 'Formal Suits';
    }
    if (categoryLower.includes('safari suit') || categoryLower.includes('safari')) {
      return 'Formal Suits';
    }
    
    // Custom Tailoring (default for most items like Shirt, Pant, Blazer, Jacket, Coat, etc.)
    return 'Custom Tailoring';
  };

  // Generate clothing items directly from API tailoringCategories
  const clothingItems = availableCategories.length > 0
    ? availableCategories.map((category, index) => ({
        id: index + 1,
        name: category,
        service: getServiceForCategory(category),
        isAvailable: true // All items from API are available
      }))
    : []; // If no categories, show empty list


  const handleAddItem = (item, event) => {
    event.preventDefault();
    event.stopPropagation();

    const existingItem = selectedItems.find(selected => selected.id === item.id);
    if (existingItem) {
      // Increase quantity if item already exists
      setSelectedItems(selectedItems.map(selected =>
        selected.id === item.id
          ? { ...selected, quantity: selected.quantity + 1 }
          : selected
      ));
    } else {
      // Add new item with quantity 1
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleKeyDown = (event, action, item) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (action === 'add') {
        handleAddItem(item, event);
      } else if (action === 'remove') {
        handleRemoveItem(item.id);
      } else if (action === 'increment') {
        handleQuantityChange(item.id, 1);
      } else if (action === 'decrement') {
        handleQuantityChange(item.id, -1);
      }
    }
  };

  const handleQuantityChange = (itemId, change) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null; // Remove item if quantity becomes 0
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item !== null));
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const getTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="clothes-selection-container">
      <div className="clothes-selection-header">
        <h3 className="clothes-selection-title">Select Clothes to Stitch</h3>
        <p className="clothes-selection-subtitle">
          Choose the items you want to get stitched from {tailorName}
        </p>
      </div>

      {/* Services Offered Section */}
      <div className="services-section">
        <h4 className="section-label">Services Offered</h4>
        <div className="services-tags">
          {services.map((service, index) => (
            <span key={index} className="service-tag">
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* Available Items */}
      <div className="available-items-section">
        <h4 className="section-label">Available Items</h4>
        <div className="items-grid">
          {clothingItems.length > 0 ? (
            clothingItems.map((item) => (
              <button
                key={item.id}
                onClick={(e) => handleAddItem(item, e)}
                onKeyDown={(e) => handleKeyDown(e, 'add', item)}
                className="item-card"
                aria-label={`Add ${item.name}`}
                tabIndex={0}
              >
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                </div>
                <div className="add-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              </button>
            ))
          ) : (
            <div className="no-items-message">
              <p>No items available from this tailor.</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="selected-items-section">
          <h4 className="section-label">Selected Items ({getTotalItems()})</h4>
          <div className="selected-items-list">
            {selectedItems.map((item) => (
              <div key={item.id} className="selected-item-card">
                <div className="selected-item-info">
                  <span className="selected-item-name">{item.name}</span>
                </div>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    onKeyDown={(e) => handleKeyDown(e, 'decrement', item)}
                    className="quantity-btn minus"
                    aria-label={`Decrease quantity of ${item.name}`}
                    tabIndex={0}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <span className="quantity-value" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    onKeyDown={(e) => handleKeyDown(e, 'increment', item)}
                    className="quantity-btn plus"
                    aria-label={`Increase quantity of ${item.name}`}
                    tabIndex={0}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, 'remove', item)}
                    className="remove-btn"
                    aria-label={`Remove ${item.name} from selection`}
                    title="Remove"
                    tabIndex={0}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Tailor Section */}
      <div className="recommended-tailor-section">
        <h4 className="section-label">Recommended Tailor</h4>
        <div className="recommended-tailor-card">
          <div className="tailor-info">
            <div className="tailor-avatar">
              {tailorName?.charAt(0) || 'T'}
            </div>
            <div className="tailor-details">
              <span className="tailor-name">{tailorName || 'Tailor'}</span>
              <div className="tailor-rating">
                <span className="stars">★★★★★</span>
                <span className="rating-text">4.5 (120 reviews)</span>
              </div>
            </div>
          </div>
          <div className="tailor-badge">
            Recommended
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="clothes-selection-actions">
        {onBack && (
          <button onClick={onBack} className="back-btn">
            Back
          </button>
        )}
        <button
          onClick={() => onNext(selectedItems)}
          className="next-btn"
          disabled={selectedItems.length === 0}
          aria-label={`Continue with ${getTotalItems()} ${getTotalItems() === 1 ? 'item' : 'items'} selected`}
        >
          Continue ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})
        </button>
      </div>
    </div>
  );
};

export default ClothesSelection;

