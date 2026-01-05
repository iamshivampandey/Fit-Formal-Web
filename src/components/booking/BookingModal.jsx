import React, { useState } from 'react';
import ClothesSelection from './ClothesSelection';
import DatePicker from './DatePicker';
import SlotList from './SlotList';
import AddressInput from './AddressInput';
import OrderConfirmation from './OrderConfirmation';
import BookingSuccess from './BookingSuccess';
import './BookingModal.css';

const BookingModal = ({ onClose, tailorName, tailorServices, businessId, user, tailorItemPrices }) => {
  const [step, setStep] = useState(0); // 0: ClothesSelection, 1: DatePicker, 2: SlotList, 3: MeasurementAddress, 4: DeliveryAddress, 5: OrderConfirmation
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [measurementAddress, setMeasurementAddress] = useState(null);
  const [measurementAddressId, setMeasurementAddressId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryAddressId, setDeliveryAddressId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

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
    // Move to measurement address input step after slot selection
    setStep(3);
  };

  const handleMeasurementAddressSubmit = (address, addressId) => {
    setMeasurementAddress(address);
    setMeasurementAddressId(addressId);
    // Move to delivery address input step
    setStep(4);
  };

  const handleDeliveryAddressSubmit = (address, addressId) => {
    setDeliveryAddress(address);
    setDeliveryAddressId(addressId);
    // Move to order confirmation step
    setStep(5);
  };

  const handleOrderConfirm = async () => {
    if (!user || !user.id) {
      console.error('User not found');
      alert('Please log in to create an order');
      return;
    }

    if (!selectedClothes || selectedClothes.length === 0) {
      console.error('No clothes selected');
      alert('Please select at least one item');
      return;
    }

    if (!measurementAddress && !measurementAddressId) {
      console.error('No measurement address');
      alert('Please provide measurement address');
      return;
    }

    if (!deliveryAddress && !deliveryAddressId) {
      console.error('No delivery address');
      alert('Please provide delivery address');
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Calculate dates
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      // Parse time slot
      let hour = 14; // Default to 2pm
      if (selectedSlot?.time) {
        const timeStr = selectedSlot.time.split('-')[0].trim();
        const isPM = timeStr.toLowerCase().includes('pm');
        hour = parseInt(timeStr.replace(/[^0-9]/g, ''));
        
        if (isPM && hour !== 12) {
          hour += 12;
        } else if (!isPM && hour === 12) {
          hour = 0;
        }
      }
      
      const measurementYear = tomorrow.getFullYear();
      const measurementMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const measurementDay = String(tomorrow.getDate()).padStart(2, '0');
      const measurementHour = String(hour).padStart(2, '0');
      const measurementDateStr = `${measurementYear}-${measurementMonth}-${measurementDay}T${measurementHour}:00:00`;
      const measurementDateObj = new Date(measurementDateStr);
      
      const stitchingYear = selectedDate.getFullYear();
      const stitchingMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const stitchingDay = String(selectedDate.getDate()).padStart(2, '0');
      const stitchingDateStr = `${stitchingYear}-${stitchingMonth}-${stitchingDay}T00:00:00`;
      const stitchingDateObj = new Date(stitchingDateStr);
      
      const bookingDateObj = new Date();
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

      // Build orderItems array
      const orderItems = selectedClothes.map(item => {
        const priceInfo = getItemPriceInfo(item);
        const fullPrice = priceInfo ? (priceInfo.FullPrice || priceInfo.fullPrice || 0) : 0;
        const discountPrice = priceInfo ? (priceInfo.DiscountPrice || priceInfo.discountPrice || 0) : 0;
        const unitPrice = discountPrice > 0 ? discountPrice : fullPrice;
        const quantity = item.quantity || 1;
        const itemTotal = unitPrice * quantity;

        // Format dates as ISO strings, preserving the date correctly
        const formatDateToISO = (date) => {
          if (!date) return null;
          const dateObj = date instanceof Date ? date : new Date(date);
          
          // Get local date/time components
          const year = dateObj.getFullYear();
          const month = dateObj.getMonth();
          const day = dateObj.getDate();
          const hours = dateObj.getHours();
          const minutes = dateObj.getMinutes();
          const seconds = dateObj.getSeconds();
          
          // Create UTC date with the same date components
          // This preserves the date part when converting to ISO
          const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
          
          return utcDate.toISOString();
        };

        // Build measurement slot object
        const measurementSlotObj = selectedSlot ? {
          time: selectedSlot.time || selectedSlot.startTime || '',
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          id: selectedSlot.id
        } : null;

        return {
          itemType: item.service || 'Custom Tailoring',
          productCode: `ITEM-${item.id}`,
          description: item.name,
          shopId: null, // Orders from tailor should have shopId as null
          tailorId: businessId ? parseInt(businessId) : null,
          quantity: quantity,
          unit: 'piece',
          unitPrice: unitPrice,
          itemTotal: itemTotal,
          status: 'Pending',
          measurementDate: formatDateToISO(measurementDateObj),
          measurementSlot: measurementSlotObj,
          stitchingDate: formatDateToISO(stitchingDateObj),
          notes: ''
        };
      });

      // Calculate total amount
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.itemTotal || 0), 0);

      // Calculate delivery date (5 days after stitching date)
      // Ensure we're working with the date correctly to avoid timezone issues
      const calculateDeliveryDate = (stitchingDate) => {
        if (!stitchingDate) return null;
        const stitching = new Date(stitchingDate);
        // Set to start of day to avoid timezone issues
        stitching.setHours(0, 0, 0, 0);
        // Add 5 days
        const delivery = new Date(stitching);
        delivery.setDate(stitching.getDate() + 5);
        // Set to end of day (23:59:59) for delivery date
        delivery.setHours(23, 59, 59, 999);
        return delivery;
      };

      const deliveryDate = calculateDeliveryDate(stitchingDateObj);

      // Get orderDate (today's date/time - Booking Date)
      const orderDateObj = bookingDateObj;
      if (orderDateObj.getHours() === 0 && orderDateObj.getMinutes() === 0) {
        const now = new Date();
        orderDateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      }

      // Build optimized order payload
      const orderPayload = {
        customerId: user.id,
        orderDate: orderDateObj.toISOString(),
        orderType: 'Tailoring',
        paymentStatus: 'Pending',
        advancePaid: 0,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
        notes: `Order for ${tailorName || 'Tailor'}`,
        orderItems: orderItems
      };

      // Add measurement address (use ID if available, otherwise use object)
      if (measurementAddressId) {
        orderPayload.measurementAddressId = measurementAddressId;
        orderPayload.measurementAddressType = 'Measurement';
      } else if (measurementAddress) {
        orderPayload.measurementAddress = {
          fullName: measurementAddress.fullName,
          phoneNumber: measurementAddress.phoneNumber,
          alternatePhone: measurementAddress.alternatePhone || null,
          addressLine1: measurementAddress.addressLine1,
          addressLine2: measurementAddress.addressLine2 || null,
          landmark: measurementAddress.landmark || null,
          city: measurementAddress.city?.replace(/^string:/, '') || measurementAddress.city,
          state: measurementAddress.state,
          pincode: measurementAddress.pincode,
          addressType: measurementAddress.addressType || 'Home',
          deliveryInstructions: measurementAddress.deliveryInstructions || null,
          googleMapLink: measurementAddress.googleMapLink || null
        };
        orderPayload.measurementAddressType = 'Measurement';
      }

      // Add delivery address (use ID if available, otherwise use object)
      if (deliveryAddressId) {
        orderPayload.deliveryAddressId = deliveryAddressId;
        orderPayload.deliveryAddressType = 'Delivery';
      } else if (deliveryAddress) {
        orderPayload.deliveryAddress = {
          fullName: deliveryAddress.fullName,
          phoneNumber: deliveryAddress.phoneNumber,
          alternatePhone: deliveryAddress.alternatePhone || null,
          addressLine1: deliveryAddress.addressLine1,
          addressLine2: deliveryAddress.addressLine2 || null,
          landmark: deliveryAddress.landmark || null,
          city: deliveryAddress.city?.replace(/^string:/, '') || deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode,
          addressType: deliveryAddress.addressType || 'Home',
          deliveryInstructions: deliveryAddress.deliveryInstructions || null,
          googleMapLink: deliveryAddress.googleMapLink || null
        };
        orderPayload.deliveryAddressType = 'Delivery';
      }

      // Only include totalAmount if we have items with prices
      if (totalAmount > 0) {
        orderPayload.totalAmount = totalAmount;
      }

      console.log('📦 Creating order with payload:', orderPayload);

      // Prepare headers with authorization token
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token is available
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
        console.log('🔑 Adding authorization token to request');
      } else {
        console.warn('⚠️ No token found in user object');
      }

      // Call API
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();
      console.log('✅ Order created successfully:', orderData);

      // Show success modal
      setShowSuccess(true);
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert(`Failed to create order: ${error.message}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <div className="booking-modal-overlay">
        <div className={`booking-modal-container ${step === 3 || step === 4 ? 'address-form' : ''}`}>
          {/* Header */}
          <div className="booking-modal-header">
            <h2 className="booking-modal-title">
              {step === 0 ? 'Select Clothes' : 
               step === 1 ? 'Pick an available stitching date' : 
               step === 2 ? 'Select Measurement Slot' :
               step === 3 ? 'Delivery Address' :
               'Order Confirmation'}
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
          <div className={`booking-modal-content ${step === 3 || step === 4 ? 'address-form-content' : ''}`}>
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

            {step === 2 && (
              <SlotList
                date={selectedDate}
                onSlotSelect={handleSlotSelect}
                selectedSlot={selectedSlot}
              />
            )}

            {step === 3 && (
              <AddressInput
                user={user}
                addressType="Measurement"
                onNext={(address, addressId) => handleMeasurementAddressSubmit(address, addressId)}
                onBack={() => {
                  setStep(2);
                }}
                initialAddress={measurementAddress}
              />
            )}

            {step === 4 && (
              <AddressInput
                user={user}
                addressType="Delivery"
                onNext={(address, addressId) => handleDeliveryAddressSubmit(address, addressId)}
                onBack={() => {
                  setStep(3);
                }}
                initialAddress={deliveryAddress}
              />
            )}

            {step === 5 && selectedSlot && (measurementAddress || measurementAddressId) && (deliveryAddress || deliveryAddressId) && (
              <OrderConfirmation
                bookingDate={new Date()}
                measurementDate={(() => {
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);
                  return tomorrow;
                })()}
                measurementSlot={selectedSlot}
                stitchingDate={selectedDate}
                deliveryDate={(() => {
                  if (!selectedDate) return null;
                  const stitching = new Date(selectedDate);
                  stitching.setHours(0, 0, 0, 0);
                  const delivery = new Date(stitching);
                  delivery.setDate(stitching.getDate() + 5);
                  return delivery;
                })()}
                measurementAddress={measurementAddress}
                deliveryAddress={deliveryAddress}
                selectedClothes={selectedClothes}
                tailorName={tailorName}
                tailorItemPrices={tailorItemPrices}
                onConfirm={handleOrderConfirm}
                onBack={() => {
                  setStep(4);
                }}
                isLoading={isCreatingOrder}
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

