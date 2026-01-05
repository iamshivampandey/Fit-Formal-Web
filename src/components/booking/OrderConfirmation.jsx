import React from 'react';

const OrderConfirmation = ({ 
  bookingDate, 
  measurementDate, 
  measurementSlot,
  stitchingDate, 
  deliveryDate,
  measurementAddress,
  deliveryAddress,
  selectedClothes,
  tailorName,
  tailorItemPrices,
  onConfirm,
  onBack,
  isLoading = false 
}) => {
  
  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateWithTime = (date, time) => {
    if (!date) return '';
    const dateStr = formatDate(date);
    return time ? `${dateStr} - ${time}` : dateStr;
  };

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const todayDate = bookingDate ? new Date(bookingDate) : getTodayDate();
  const measurementDateObj = measurementDate ? new Date(measurementDate) : null;
  const stitchingDateObj = stitchingDate ? new Date(stitchingDate) : null;
  const deliveryDateObj = deliveryDate ? new Date(deliveryDate) : null;

  // Calculate price breakdown
  const calculatePriceBreakdown = () => {
    if (!selectedClothes || selectedClothes.length === 0) {
      return { totalFullPrice: 0, totalDiscount: 0, platformFee: 0, finalTotal: 0, totalSavings: 0 };
    }

    // Parse tailorItemPrices if needed
    const parseTailorItemPrices = () => {
      if (!tailorItemPrices) return [];
      if (Array.isArray(tailorItemPrices)) return tailorItemPrices;
      if (typeof tailorItemPrices === 'string') {
        try {
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

    // Helper to get price info for an item
    const getItemPriceInfo = (item) => {
      const priceInfo = itemPrices.find(price => {
        const priceName = (price.Name || price.name || '').toLowerCase().trim();
        const itemName = (item.name || '').toLowerCase().trim();
        if (priceName === itemName) return true;
        if (price.ItemId && item.id && price.ItemId === item.id) return true;
        if (price.itemId && item.id && price.itemId === item.id) return true;
        return false;
      });
      return priceInfo || null;
    };

    let totalFullPrice = 0;
    let totalDiscount = 0;

    selectedClothes.forEach(item => {
      const priceInfo = getItemPriceInfo(item);
      if (priceInfo) {
        const fullPrice = priceInfo.FullPrice || priceInfo.fullPrice || 0;
        const discountPrice = priceInfo.DiscountPrice || priceInfo.discountPrice || 0;
        const discountValue = priceInfo.DiscountValue || priceInfo.discountValue || 0;
        
        const itemDiscountPerUnit = discountValue > 0 ? discountValue : (fullPrice > discountPrice ? fullPrice - discountPrice : 0);
        
        totalFullPrice += fullPrice * (item.quantity || 1);
        totalDiscount += itemDiscountPerUnit * (item.quantity || 1);
      }
    });

    // Platform fee (1% of discounted price or minimum ₹7)
    const discountedPrice = totalFullPrice - totalDiscount;
    const platformFee = Math.max(7, Math.round(discountedPrice * 0.01));
    
    const finalTotal = discountedPrice + platformFee;
    const totalSavings = totalDiscount;

    return {
      totalFullPrice,
      totalDiscount,
      platformFee,
      finalTotal,
      totalSavings
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        color: '#1c1c1c', 
        marginBottom: '1rem' 
      }}>
        Order Summary
      </h3>

      {/* Dates Section */}
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
          <strong style={{ color: '#654321' }}>Measurement Date:</strong> <span style={{ color: '#8E8E93' }}>{formatDateWithTime(measurementDateObj, measurementSlot?.time)}</span>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#1c1c1c', marginBottom: '0.5rem' }}>
          <strong style={{ color: '#654321' }}>Stitching Date:</strong> <span style={{ color: '#8E8E93' }}>{formatDate(stitchingDateObj)}</span>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#1c1c1c' }}>
          <strong style={{ color: '#654321' }}>Delivery By:</strong> <span style={{ color: '#8E8E93' }}>{formatDate(deliveryDateObj)}</span>
        </p>
      </div>

      {/* Measurement Address Section */}
      {measurementAddress && (
        <div style={{ 
          backgroundColor: '#F2F2F7', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #E5E5EA'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: '#654321', 
            marginBottom: '0.75rem' 
          }}>
            Measurement Address
          </h4>
          <div style={{ fontSize: '0.875rem', color: '#1c1c1c', lineHeight: '1.6' }}>
            <p style={{ margin: '0.25rem 0', fontWeight: 500 }}>{measurementAddress.fullName}</p>
            <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
              {measurementAddress.phoneNumber}
              {measurementAddress.alternatePhone && ` / ${measurementAddress.alternatePhone}`}
            </p>
            <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
              {measurementAddress.addressLine1}
              {measurementAddress.addressLine2 && `, ${measurementAddress.addressLine2}`}
            </p>
            {measurementAddress.landmark && (
              <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
                Near {measurementAddress.landmark}
              </p>
            )}
            <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
              {measurementAddress.city?.replace(/^string:/, '') || measurementAddress.city}, {measurementAddress.state} - {measurementAddress.pincode}
            </p>
            {measurementAddress.addressType && (
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#654321' }}>
                <strong>Type:</strong> {measurementAddress.addressType}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delivery Address Section */}
      {deliveryAddress && (
        <div style={{ 
          backgroundColor: '#F2F2F7', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #E5E5EA'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: '#654321', 
            marginBottom: '0.75rem' 
          }}>
            Delivery Address
          </h4>
          <div style={{ fontSize: '0.875rem', color: '#1c1c1c', lineHeight: '1.6' }}>
            <p style={{ margin: '0.25rem 0', fontWeight: 500 }}>{deliveryAddress.fullName}</p>
            <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
              {deliveryAddress.phoneNumber}
              {deliveryAddress.alternatePhone && ` / ${deliveryAddress.alternatePhone}`}
            </p>
            <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
              {deliveryAddress.addressLine1}
              {deliveryAddress.addressLine2 && `, ${deliveryAddress.addressLine2}`}
            </p>
            {deliveryAddress.landmark && (
              <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
                Near {deliveryAddress.landmark}
              </p>
            )}
            <p style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
              {deliveryAddress.city?.replace(/^string:/, '') || deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
            </p>
            {deliveryAddress.addressType && (
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#654321' }}>
                <strong>Type:</strong> {deliveryAddress.addressType}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Selected Clothes Section */}
      {selectedClothes && selectedClothes.length > 0 && (
        <div style={{ 
          backgroundColor: '#F2F2F7', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #E5E5EA'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: '#654321', 
            marginBottom: '0.75rem' 
          }}>
            Selected Items ({selectedClothes.length})
          </h4>
          <div style={{ fontSize: '0.875rem', color: '#1c1c1c' }}>
            {selectedClothes.map((item, index) => (
              <p key={index} style={{ margin: '0.25rem 0', color: '#8E8E93' }}>
                {item.name} {item.quantity > 1 && `(x${item.quantity})`}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tailor Info */}
      {tailorName && (
        <div style={{ 
          backgroundColor: '#F2F2F7', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #E5E5EA'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#1c1c1c' }}>
            <strong style={{ color: '#654321' }}>Tailor:</strong> <span style={{ color: '#8E8E93' }}>{tailorName}</span>
          </p>
        </div>
      )}

      {/* Price Summary */}
      {priceBreakdown.finalTotal > 0 && (
        <div style={{ 
          backgroundColor: '#F2F2F7', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #E5E5EA'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: '#654321', 
            marginBottom: '0.75rem' 
          }}>
            Price Summary
          </h4>
          <div style={{ fontSize: '0.875rem', color: '#1c1c1c' }}>
            {priceBreakdown.totalFullPrice > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                color: '#8E8E93'
              }}>
                <span>Subtotal:</span>
                <span>₹{priceBreakdown.totalFullPrice.toFixed(2)}</span>
              </div>
            )}
            {priceBreakdown.totalDiscount > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                color: '#8E8E93'
              }}>
                <span>Discount:</span>
                <span style={{ color: '#34C759' }}>-₹{priceBreakdown.totalDiscount.toFixed(2)}</span>
              </div>
            )}
            {priceBreakdown.platformFee > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                color: '#8E8E93'
              }}>
                <span>Platform Fee:</span>
                <span>₹{priceBreakdown.platformFee.toFixed(2)}</span>
              </div>
            )}
            <div style={{ 
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #E5E5EA',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: '#1c1c1c' 
              }}>
                Total Amount:
              </span>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                color: '#654321' 
              }}>
                ₹{priceBreakdown.finalTotal.toFixed(2)}
              </span>
            </div>
            {priceBreakdown.totalSavings > 0 && (
              <div style={{ 
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#34C759',
                fontWeight: 500
              }}>
                You save ₹{priceBreakdown.totalSavings.toFixed(2)} on this order
              </div>
            )}
          </div>
        </div>
      )}

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

export default OrderConfirmation;

