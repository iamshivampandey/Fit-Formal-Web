import { useState, useEffect } from 'react';
import './OrdersPerDay.css';

const OrdersPerDay = ({ user, businessId, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ordersData, setOrdersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState(7); // Show last 7 days by default
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger to refresh data

  // Generate date range
  const generateDateRange = (days) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date for table header
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Fetch orders and availability for date range
  useEffect(() => {
    const fetchOrdersData = async () => {
      setIsLoading(true);
      try {
        const dates = generateDateRange(dateRange);
        
        // Get businessId and auth token
        const businessIdToUse = businessId || user?.businessId || user?.BusinessId;
        const authToken = user?.token || localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (!businessIdToUse) {
          console.error('BusinessId not found for fetching data');
          setIsLoading(false);
          return;
        }
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        } else {
          console.warn('No auth token found for fetching orders');
        }

        // Fetch tailor date availability
        // API: GET /api/tailor-date-availability/:businessId
        const availabilityResponse = await fetch(
          `/api/tailor-date-availability/${businessIdToUse}`,
          {
            method: 'GET',
            headers: headers,
          }
        );

        let availabilityData = [];
        if (availabilityResponse.ok) {
          const availabilityResult = await availabilityResponse.json();
          const rawData = availabilityResult.data || availabilityResult.availability || [];
          
          // Normalize availability data: handle Date (ISO format) and IsClosed (capitalized)
          availabilityData = rawData.map(item => {
            // Extract date from ISO format (e.g., "2025-12-08T00:00:00.000Z" -> "2025-12-08")
            const dateValue = item.Date || item.date;
            const normalizedDate = dateValue ? new Date(dateValue).toISOString().split('T')[0] : null;
            
            // Handle both IsClosed and isClosed (case-insensitive)
            const isClosed = item.IsClosed !== undefined ? item.IsClosed : item.isClosed;
            
            return {
              date: normalizedDate,
              isClosed: isClosed,
              ...item // Keep other fields
            };
          });
          
          console.log('✅ Fetched availability data:', availabilityData);
        } else {
          console.warn('Failed to fetch availability data, using defaults');
        }

        // Fetch orders for date range (optional - if you have this endpoint)
        let ordersData = [];
        try {
          const ordersResponse = await fetch(
            `/api/orders/range?startDate=${dates[0]}&endDate=${dates[dates.length-1]}&tailorId=${businessIdToUse}`,
            {
              method: 'GET',
              headers: headers,
            }
          );

          if (ordersResponse.ok) {
            const ordersResult = await ordersResponse.json();
            ordersData = ordersResult.data || ordersResult.orders || [];
            console.log('✅ Fetched orders data:', ordersData);
          }
        } catch (ordersError) {
          console.warn('Orders API not available, using availability data only');
        }
        
        // Merge availability and orders data
        // Expected availability API response format:
        // {
        //   success: true,
        //   data: [
        //     {
        //       date: "2025-12-03",
        //       isClosed: false,  // false = taking orders (active), true = not taking orders (inactive)
        //       ...
        //     }
        //   ]
        // }
        
        const completeData = dates.map(date => {
          // Find availability for this date (normalized date comparison)
          const availabilityItem = availabilityData.find(item => item.date === date);
          
          // Find orders for this date
          const orderItem = ordersData.find(item => item.date === date);
          
          // Convert isClosed to isTakingOrders
          // Logic:
          // - If date matches: IsClosed: true → toggle OFF (isTakingOrders: false), IsClosed: false → toggle ON (isTakingOrders: true)
          // - If date doesn't match: toggle ON (isTakingOrders: true) by default
          let isTakingOrders = true; // Default: toggle ON (taking orders)
          
          if (availabilityItem) {
            // Date matches: use IsClosed value
            // IsClosed: true → not taking orders (toggle OFF)
            // IsClosed: false → taking orders (toggle ON)
            isTakingOrders = !availabilityItem.isClosed;
          }
          // If no match, isTakingOrders remains true (default: taking orders)
          
          return {
            date,
            totalOrders: orderItem?.totalOrders ?? 0,
            isTakingOrders: isTakingOrders,
            orders: orderItem?.orders || []
          };
        });
        
        setOrdersData(completeData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        
        // Fallback to mock data if API fails (for development/testing)
        // Remove this fallback in production
        console.warn('Using mock data as fallback');
        const dates = generateDateRange(dateRange);
        const mockData = dates.map(date => ({
          date,
          totalOrders: 0, // Default to 0 orders
          isTakingOrders: true, // Default to active (taking orders)
          orders: [] // No orders by default
        }));
        setOrdersData(mockData);
        setIsLoading(false);
      }
    };

    fetchOrdersData();
  }, [dateRange, businessId, user?.businessId, user?.BusinessId, user?.token, refreshTrigger]);

  // Handle toggle change
  const handleToggleChange = async (date, currentValue) => {
    const newValue = !currentValue;
    
    // Get businessId from prop, user object, or fallback to multiple possible fields
    const businessIdToUse = businessId || user?.businessId || user?.BusinessId ;
    
    if (!businessIdToUse) {
      console.error('BusinessId not found:', { businessId, user });
      alert('Error: Business ID not found. Please refresh the page and try again.');
      return;
    }
    
    // isClosed logic:
    // - When toggle is ON (newValue = true, taking orders): isClosed = false
    // - When toggle is OFF (newValue = false, not taking orders): isClosed = true
    const isClosed = !newValue;
    
    console.log('Using BusinessId:', businessIdToUse);
    console.log(`Toggle clicked for ${date}: ${currentValue ? 'ON' : 'OFF'} → ${newValue ? 'ON' : 'OFF'}`);
    console.log('Sending request with:', { businessId: businessIdToUse, date, isClosed, isTakingOrders: newValue });
    
    // Optimistically update UI
    setOrdersData(prev => 
      prev.map(item => 
        item.date === date 
          ? { ...item, isTakingOrders: newValue }
          : item
      )
    );
    
    try {
      // API call to update availability - call when toggle changes (especially when inactive)
      // Get token from user object first, then fallback to localStorage
      const authToken = user?.token || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      console.log('Token check:', {
        userToken: user?.token ? 'Found' : 'Not found',
        localStorageToken: localStorage.getItem('token') ? 'Found' : 'Not found',
        finalToken: authToken ? 'Found' : 'NOT FOUND',
        userObject: user
      });
      
      if (!authToken) {
        console.error('No authentication token found');
        console.error('User object:', user);
        console.error('localStorage token:', localStorage.getItem('token'));
        console.error('localStorage authToken:', localStorage.getItem('authToken'));
        
        // Revert UI change since we can't make the API call
        setOrdersData(prev => 
          prev.map(item => 
            item.date === date 
              ? { ...item, isTakingOrders: currentValue }
              : item
          )
        );
        
        alert('Authentication required. Please log in again.');
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      
      console.log('Request headers:', headers);

        const requestBody = {
          businessId: Number(businessIdToUse), // Ensure it's a number
          date: date,
          isClosed: isClosed // true when toggle is OFF, false when toggle is ON
        };

      console.log('API Request:', {
        url: '/api/tailor-date-availability',
        method: 'POST',
        headers,
        body: requestBody
      });

      const response = await fetch(`/api/tailor-date-availability`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `Failed to update availability: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully updated availability for ${date}: ${newValue ? 'ON' : 'OFF'}`, data);
      
      // Refresh data from API to get the latest status
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      console.error('Error details:', {
        message: error.message,
        businessId: businessIdToUse,
        date: date,
        isClosed: isClosed,
        isTakingOrders: newValue,
        user: user
      });
      
      // Don't revert on error - keep the UI change
      // The toggle will remain in the new state even if API call fails
      // This allows the UI to work even when backend is not ready
      console.warn('⚠️ Toggle state updated locally, but API call failed. State will persist in UI.');
      
      // Show alert to user about the error
      alert(`Failed to update availability: ${error.message}\n\nPlease check:\n1. Business ID is available\n2. Backend API is running\n3. Network connection is active`);
    }
  };

  const dates = generateDateRange(dateRange);

  return (
    <div className="orders-per-day-page">
      {/* Header */}
      <header className="orders-per-day-header">
        <div className="orders-per-day-header-content">
          <div className="orders-per-day-header-left">
            {onBack && (
              <button onClick={onBack} className="orders-per-day-back-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <h1 className="orders-per-day-title">Orders Per Day</h1>
          </div>
          
          <div className="orders-per-day-header-actions">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="orders-per-day-date-range-select"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="orders-per-day-main">
        <div className="orders-per-day-container">
          {isLoading ? (
            <div className="orders-per-day-loading">
              <div className="orders-per-day-spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : (
            <div className="orders-per-day-table-wrapper">
              <table className="orders-per-day-table">
                <thead>
                  <tr>
                    <th className="orders-per-day-col-date">Date</th>
                    <th className="orders-per-day-col-orders">Total Orders</th>
                    <th className="orders-per-day-col-status">Status</th>
                    <th className="orders-per-day-col-toggle">Taking Orders</th>
                    <th className="orders-per-day-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.map((item) => (
                    <tr key={item.date} className={item.date === selectedDate ? 'selected' : ''}>
                      <td className="orders-per-day-col-date">
                        <div className="orders-per-day-date-cell">
                          <span className="orders-per-day-date-main">{formatDateHeader(item.date)}</span>
                          <span className="orders-per-day-date-sub">{formatDate(item.date)}</span>
                        </div>
                      </td>
                      <td className="orders-per-day-col-orders">
                        <div className="orders-per-day-orders-cell">
                          <span className="orders-per-day-orders-value">{item.totalOrders}</span>
                          <span className="orders-per-day-orders-label">orders</span>
                        </div>
                      </td>
                      <td className="orders-per-day-col-status">
                        <div className={`orders-per-day-status-badge ${item.isTakingOrders ? 'active' : 'inactive'}`}>
                          {item.isTakingOrders ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="orders-per-day-col-toggle">
                        <label className="orders-per-day-toggle-switch">
                          <input
                            type="checkbox"
                            checked={item.isTakingOrders}
                            onChange={() => handleToggleChange(item.date, item.isTakingOrders)}
                            className="orders-per-day-toggle-input"
                          />
                          <span className="orders-per-day-toggle-slider"></span>
                        </label>
                      </td>
                      <td className="orders-per-day-col-actions">
                        <button 
                          className="orders-per-day-view-btn"
                          onClick={() => setSelectedDate(item.date)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected Date Details */}
          {selectedDate && !isLoading && (
            <div className="orders-per-day-details">
              <h3 className="orders-per-day-details-title">
                Orders for {formatDate(selectedDate)}
              </h3>
              {ordersData.find(item => item.date === selectedDate)?.orders?.length > 0 ? (
                <div className="orders-per-day-orders-list">
                  {ordersData.find(item => item.date === selectedDate)?.orders.map((order) => (
                    <div key={order.id} className="orders-per-day-order-item">
                      <div className="orders-per-day-order-info">
                        <h4 className="orders-per-day-order-id">{order.id}</h4>
                        <p className="orders-per-day-order-customer">{order.customerName}</p>
                      </div>
                      <div className="orders-per-day-order-meta">
                        <span className={`orders-per-day-order-status orders-per-day-order-status-${order.status}`}>
                          {order.status}
                        </span>
                        <span className="orders-per-day-order-amount">₹{order.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="orders-per-day-no-orders">No orders for this date</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPerDay;

