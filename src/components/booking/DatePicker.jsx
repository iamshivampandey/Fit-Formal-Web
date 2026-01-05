import React, { useState, useEffect } from 'react';
import './DatePicker.css';

const DatePicker = ({ onDateSelect, selectedDate, businessId, user, onBack }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate dates from today to next 60 days
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!businessId) {
        console.warn('No businessId provided to DatePicker');
        return;
      }

      setIsLoading(true);
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Get auth token from user object first, then fallback to localStorage
        // Also check if user is stored in localStorage
        let authToken = user?.token;
        
        if (!authToken) {
          // Try localStorage
          authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
        }
        
        // If still no token, try parsing user from localStorage
        if (!authToken) {
          try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              const parsedUser = JSON.parse(savedUser);
              authToken = parsedUser?.token;
            }
          } catch (e) {
            console.warn('Error parsing user from localStorage:', e);
          }
        }
        
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
          console.log('🔑 Using auth token for availability API');
        } else {
          console.warn('⚠️ No auth token found for availability API');
        }

        console.log('📅 Fetching availability for businessId:', businessId);
        const response = await fetch(`/api/tailor-date-availability/${businessId}`, {
          method: 'GET',
          headers: headers,
        });

        if (response.ok) {
          const result = await response.json();
          const rawData = result.data || [];
          
          // Normalize availability data: handle Date (ISO format), IsClosed (capitalized), and totalOrderCount
          const normalizedData = rawData.map(item => {
            const dateValue = item.Date || item.date;
            const normalizedDate = dateValue ? new Date(dateValue).toISOString().split('T')[0] : null;
            const isClosed = item.IsClosed !== undefined ? item.IsClosed : item.isClosed;
            const totalOrderCount = item.totalOrderCount || 0;
            
            return {
              date: normalizedDate,
              isClosed: isClosed === true,
              totalOrderCount: totalOrderCount,
            };
          });
          
          setAvailabilityData(normalizedData);
          console.log('✅ Availability data fetched:', normalizedData);
        } else if (response.status === 401) {
          console.error('❌ 401 Unauthorized - Authentication required');
          console.error('Token check:', {
            userToken: user?.token ? 'Found' : 'Not found',
            localStorageToken: localStorage.getItem('token') ? 'Found' : 'Not found',
            parsedUserToken: (() => {
              try {
                const savedUser = localStorage.getItem('user');
                return savedUser ? (JSON.parse(savedUser)?.token ? 'Found' : 'Not found') : 'No user in localStorage';
              } catch (e) {
                return 'Error parsing';
              }
            })()
          });
          // Set empty availability data - dates will default to available
          setAvailabilityData([]);
        } else {
          console.warn(`Failed to fetch availability data: ${response.status} ${response.statusText}`);
          setAvailabilityData([]);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailabilityData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [businessId]);

  // Get availability status for a date
  const getDateAvailability = (date) => {
    if (!date) return null;
    
    const dateString = date.toISOString().split('T')[0];
    const availabilityItem = availabilityData.find(item => item.date === dateString);
    
    // If no data, date is available (selectable)
    if (!availabilityItem) {
      return { isClosed: false, totalOrderCount: 0, isAvailable: true };
    }
    
    // Date is unavailable if:
    // 1. IsClosed is true, OR
    // 2. totalOrderCount > 0 (has bookings)
    const isUnavailable = availabilityItem.isClosed === true || (availabilityItem.totalOrderCount || 0) > 0;
    
    return {
      isClosed: availabilityItem.isClosed === true,
      totalOrderCount: availabilityItem.totalOrderCount || 0,
      isAvailable: !isUnavailable
    };
  };

  // Get calendar days for current month view (only showing dates within 60-day range)
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 60);

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month (only if within 60-day range)
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);
      
      // Only include dates from today to next 60 days
      if (currentDate >= today && currentDate <= maxDate) {
        days.push(currentDate);
      } else {
        days.push(null);
      }
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (date) => {
    if (date) {
      const availability = getDateAvailability(date);
      // Only allow selection if date is available (not closed)
      if (availability && availability.isAvailable) {
        onDateSelect(date);
      }
    }
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isBeyond60Days = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 60);
    return date > maxDate;
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Allow going back as long as we don't go before today's month
    if (newMonth >= todayMonth) {
      setCurrentMonth(newMonth);
    }
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 60);
    
    // Don't go beyond 60 days
    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 60);
  const maxDateMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  
  // Can go previous if current month is after today's month
  const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const canGoPrevious = currentMonthStart > todayMonth;
  const canGoNext = currentMonthStart < maxDateMonth;

  return (
    <div className="date-picker-container">
      {/* {onBack && (
        <button
          onClick={onBack}
          className="date-picker-back-btn"
          style={{
            padding: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#654321',
            cursor: 'pointer',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'Gilroy, sans-serif',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F2F2F7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      )} */}
      <h3 className="date-picker-title">Select Date</h3>
      
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
          Loading availability...
        </div>
      )}
      
      {/* Month Navigation */}
      <div className="date-picker-navigation">
        <button
          onClick={goToPreviousMonth}
          className="date-picker-nav-button"
          disabled={!canGoPrevious}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h4 className="date-picker-month-year">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={goToNextMonth}
          className="date-picker-nav-button"
          disabled={!canGoNext}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="date-picker-grid">
        {/* Day Headers */}
        {dayNames.map((day) => (
          <div key={day} className="date-picker-day-header">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="date-picker-empty" />;
          }

          const selected = isSelected(date);
          const today = isToday(date);
          const past = isPast(date);
          const beyond60Days = isBeyond60Days(date);
          const availability = getDateAvailability(date);
          const isClosed = availability?.isClosed === true;
          const totalOrderCount = availability?.totalOrderCount || 0;
          const isAvailable = availability?.isAvailable !== false; // Default to available if no data

          // Date is disabled if: past, beyond 60 days, closed, or has bookings (totalOrderCount > 0)
          const isDisabled = past || beyond60Days || isClosed || totalOrderCount > 0;

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDisabled && handleDateClick(date)}
              disabled={isDisabled}
              className={`
                date-picker-day
                ${isDisabled ? 'date-picker-day-disabled' : ''}
                ${selected ? 'date-picker-day-selected' : ''}
                ${today && !selected ? 'date-picker-day-today' : ''}
                ${isClosed ? 'date-picker-day-closed' : ''}
                ${totalOrderCount > 0 && !isClosed ? 'date-picker-day-booked' : ''}
              `}
              title={
                isClosed 
                  ? 'This date is closed for bookings' 
                  : totalOrderCount > 0 
                    ? `${totalOrderCount} ${totalOrderCount === 1 ? 'order' : 'orders'} booked for this date`
                    : ''
              }
            >
              <span className="date-picker-day-number">{date.getDate()}</span>
              {totalOrderCount > 0 && !isClosed && (
                <span className="date-picker-order-count">{totalOrderCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
