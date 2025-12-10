import React, { useState, useEffect } from 'react';
import './ClothesSelection.css';

const ClothesSelection = ({ tailorServices, tailorName, tailoringCategories, tailorItemPrices, onNext, onBack }) => {
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
    ? availableCategories.map((category, index) => {
        // Extract name from category object if it's an object
        let categoryName;
        if (typeof category === 'string') {
          categoryName = category;
        } else if (category.Name) {
          categoryName = category.Name;
        } else if (category.name) {
          categoryName = category.name;
        } else if (category.categoryName) {
          categoryName = category.categoryName;
        } else if (category.itemName) {
          categoryName = category.itemName;
        } else {
          categoryName = String(category);
        }
        
        return {
          id: category.ItemId || category.itemId || category.id || index + 1,
          name: categoryName,
          service: getServiceForCategory(categoryName),
          isAvailable: true // All items from API are available
        };
      })
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

  // Parse tailorItemPrices if it's a JSON string
  const parseTailorItemPrices = () => {
    if (!tailorItemPrices) return [];
    if (Array.isArray(tailorItemPrices)) return tailorItemPrices;
    if (typeof tailorItemPrices === 'string') {
      try {
        // Handle HTML entities
        const decoded = tailorItemPrices
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
        const parsed = JSON.parse(decoded);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse tailorItemPrices:', e);
        return [];
      }
    }
    return [];
  };

  const itemPrices = parseTailorItemPrices();

  // Get price info for an item by matching Name or ItemId
  const getItemPriceInfo = (item) => {
    const priceInfo = itemPrices.find(price => {
      // Match by Name (case-insensitive)
      const priceName = (price.Name || price.name || '').toLowerCase().trim();
      const itemName = (item.name || '').toLowerCase().trim();
      if (priceName === itemName) {
        console.log(`✅ Matched ${itemName} by name:`, price);
        return true;
      }
      
      // Match by ItemId
      if (price.ItemId && item.id && price.ItemId === item.id) {
        console.log(`✅ Matched ${itemName} by ItemId:`, price);
        return true;
      }
      if (price.itemId && item.id && price.itemId === item.id) {
        console.log(`✅ Matched ${itemName} by itemId:`, price);
        return true;
      }
      
      return false;
    });
    
    return priceInfo || null;
  };

  // Get price for an item (backward compatibility)
  const getItemPrice = (item) => {
    const priceInfo = getItemPriceInfo(item);
    return priceInfo ? (priceInfo.FullPrice || priceInfo.fullPrice || 0) : 0;
  };

  // Calculate price breakdown
  const calculatePriceBreakdown = () => {
    let totalFullPrice = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    selectedItems.forEach(item => {
      const priceInfo = getItemPriceInfo(item);
      if (priceInfo) {
        const fullPrice = priceInfo.FullPrice || priceInfo.fullPrice || 0;
        const discountPrice = priceInfo.DiscountPrice || priceInfo.discountPrice || 0;
        const discountValue = priceInfo.DiscountValue || priceInfo.discountValue || 0;
        
        // DiscountValue is the actual discount amount per item
        // If DiscountValue is not available, calculate: FullPrice - DiscountPrice
        const itemDiscountPerUnit = discountValue > 0 ? discountValue : (fullPrice > discountPrice ? fullPrice - discountPrice : 0);
        
        totalFullPrice += fullPrice * item.quantity;
        totalDiscount += itemDiscountPerUnit * item.quantity;
        totalItems += item.quantity;
      } else {
        // If no price info, still count items
        totalItems += item.quantity;
      }
    });

    // Platform fee (you can make this configurable)
    const discountedPrice = totalFullPrice - totalDiscount;
    const platformFee = Math.max(7, Math.round(discountedPrice * 0.01)); // 1% of discounted price or minimum ₹7
    
    const finalTotal = discountedPrice + platformFee;
    const totalSavings = totalDiscount;

    return {
      totalFullPrice,
      totalDiscount,
      platformFee,
      finalTotal,
      totalSavings,
      totalItems
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  // Debug logging
  useEffect(() => {
    console.log('🔍 ClothesSelection Debug:', {
      tailorItemPrices,
      parsedItemPrices: itemPrices,
      selectedItems,
      clothingItems,
      priceBreakdown,
      hasSelectedItems: selectedItems.length > 0
    });
    
    // Log each selected item's price match
    selectedItems.forEach(item => {
      const price = getItemPrice(item);
      console.log(`💰 ${item.name} (id: ${item.id}, qty: ${item.quantity}) - Price: ₹${price}`);
    });
  }, [tailorItemPrices, itemPrices, selectedItems, clothingItems, priceBreakdown]);

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
          <div className="selected-items-header">
            <div className="selected-items-header-left">
              <div className="selected-items-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h4 className="section-label">Selected Items ({getTotalItems()})</h4>
            </div>
            <div className="selected-items-badge">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}</div>
          </div>
          <div className="selected-items-list">
            {selectedItems.map((item) => {
              const priceInfo = getItemPriceInfo(item);
              const itemPrice = getItemPrice(item);
              const discountValue = priceInfo ? (priceInfo.DiscountValue || priceInfo.discountValue || 0) : 0;
              const discountPrice = priceInfo ? (priceInfo.DiscountPrice || priceInfo.discountPrice || 0) : 0;
              const itemDiscountPerUnit = discountValue > 0 ? discountValue : (itemPrice > discountPrice ? itemPrice - discountPrice : 0);
              const hasDiscount = itemDiscountPerUnit > 0;
              const finalPrice = itemPrice - itemDiscountPerUnit;
              const itemTotal = finalPrice * item.quantity;
              
              return (
                <div key={item.id} className="selected-item-card">
                  <div className="selected-item-left">
                    <div className="selected-item-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                    <div className="selected-item-info">
                      <div className="selected-item-name-row">
                        <span className="selected-item-name">{item.name}</span>
                        {hasDiscount && (
                          <span className="discount-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <text x="12" y="18" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif">₹</text>
                            </svg>
                            Save ₹{itemDiscountPerUnit.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {itemPrice > 0 && (
                        <div className="selected-item-price-row">
                          {hasDiscount ? (
                            <>
                              <span className="original-price">₹{itemPrice.toFixed(2)}</span>
                              <span className="discounted-price">₹{finalPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="regular-price">₹{itemPrice.toFixed(2)}</span>
                          )}
                          <span className="item-total">Total: ₹{itemTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="selected-item-right">
                    <div className="quantity-controls-wrapper">
                      <div className="quantity-label">Qty</div>
                      <div className="quantity-controls">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          onKeyDown={(e) => handleKeyDown(e, 'decrement', item)}
                          className="quantity-btn minus"
                          aria-label={`Decrease quantity of ${item.name}`}
                          tabIndex={0}
                          type="button"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, 'remove', item)}
                      className="remove-btn"
                      aria-label={`Remove ${item.name} from selection`}
                      title="Remove"
                      tabIndex={0}
                      type="button"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Price Details Section */}
          <div className="price-details-section">
            <div className="price-details-card">
              <div className="price-details-header">
                <div className="price-details-header-left">
                  <div className="price-details-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <text x="12" y="18" textAnchor="middle" fontSize="20" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif">₹</text>
                    </svg>
                  </div>
                  <h4 className="price-details-title">Price Details</h4>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="price-details-chevron">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>
              
              <div className="price-details-content">
                <div className="price-detail-row">
                  <div className="price-detail-label">
                    <div className="price-detail-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    </div>
                    <span>Price ({priceBreakdown.totalItems} {priceBreakdown.totalItems === 1 ? 'item' : 'items'})</span>
                  </div>
                  <span className="price-detail-value">₹{priceBreakdown.totalFullPrice.toFixed(2)}</span>
                </div>

                {priceBreakdown.totalDiscount > 0 && (
                  <div className="price-detail-row discount-row">
                    <div className="price-detail-label">
                      <div className="price-detail-icon discount-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <text x="12" y="18" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif">₹</text>
                        </svg>
                      </div>
                      <span>Discount</span>
                    </div>
                    <span className="price-detail-value discount">-₹{priceBreakdown.totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="price-detail-row">
                  <div className="price-detail-label">
                    <div className="price-detail-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    </div>
                    <span>Platform Fee</span>
                  </div>
                  <span className="price-detail-value">₹{priceBreakdown.platformFee.toFixed(2)}</span>
                </div>

                <div className="price-details-divider"></div>

                <div className="price-detail-row total-row">
                  <div className="price-detail-label">
                    <span>Total Amount</span>
                  </div>
                  <span className="price-detail-value total-amount">₹{priceBreakdown.finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {priceBreakdown.totalSavings > 0 && (
                <div className="savings-banner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>You will save ₹{priceBreakdown.totalSavings.toFixed(2)} on this order</span>
                </div>
              )}
            </div>
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

