// import { useState, useEffect } from 'react';
// import './TailorsList.css';

// const TailorsList = ({ user, onClose, onSelectTailor }) => {
//   const [tailors, setTailors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchTailors();
//   }, []);

//   const fetchTailors = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log('🚀 Fetching tailors from /api/tailors');
      
//       // Prepare headers with authorization token
//       const headers = {
//         'Content-Type': 'application/json',
//       };
      
//       // Add authorization header if token is available
//       if (user?.token) {
//         headers['Authorization'] = `Bearer ${user.token}`;
//         console.log('🔑 Adding authorization token to request');
//       } else {
//         console.warn('⚠️ No token found in user object');
//       }
      
//       const response = await fetch('/api/tailors', {
//         method: 'GET',
//         headers: headers,
//       });

//       console.log('📡 Response status:', response.status);

//       if (!response.ok) {
//         throw new Error(`Failed to fetch tailors: ${response.statusText}`);
//       }

//       const data = await response.json();
//       console.log('✅ Tailors data received:', data);

//       // Check if response indicates an error
//       if (data.success === false) {
//         throw new Error(data.message || 'Failed to fetch tailors');
//       }

//       // Handle the new API response structure: { success: true, message: "...", count: 3, data: [...] }
//       // Also handle array response and object with data property for backward compatibility
//       const tailorsData = Array.isArray(data) ? data : (data.data || data.tailors || []);
//       setTailors([tailorsData,tailorsData,tailorsData,tailorsData,tailorsData,tailorsData,tailorsData,tailorsData,tailorsData,tailorsData]);
//     } catch (err) {
//       console.error('❌ Error fetching tailors:', err);
//       // Extract error message from response if available
//       const errorMessage = err.message || 'Failed to load tailors. Please try again.';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectTailor = (tailor) => {
//     if (onSelectTailor) {
//       onSelectTailor(tailor);
//     }
//   };

//   return (
//     <div className="tailors-list-overlay" onClick={onClose}>
//       <div className="tailors-list-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="tailors-list-header">
//           <h2 className="tailors-list-title">Available Tailors</h2>
//           <button className="tailors-list-close" onClick={onClose}>
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <line x1="18" y1="6" x2="6" y2="18"></line>
//               <line x1="6" y1="6" x2="18" y2="18"></line>
//             </svg>
//           </button>
//         </div>

//         <div className="tailors-list-content">
//           {loading ? (
//             <div className="tailors-list-loading">
//               <div className="loading-spinner"></div>
//               <p>Loading tailors...</p>
//             </div>
//           ) : error ? (
//             <div className="tailors-list-error">
//               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="12" cy="12" r="10"></circle>
//                 <line x1="12" y1="8" x2="12" y2="12"></line>
//                 <line x1="12" y1="16" x2="12.01" y2="16"></line>
//               </svg>
//               <p>{error}</p>
//               <button className="retry-btn" onClick={fetchTailors}>
//                 Try Again
//               </button>
//             </div>
//           ) : tailors.length === 0 ? (
//             <div className="tailors-list-empty">
//               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
//               </svg>
//               <p>No tailors available at the moment</p>
//             </div>
//           ) : (
//             <div className="tailors-grid">
//               {tailors.map((tailor) => (
//                 <div key={tailor.id || tailor._id} className="tailor-card">
//                   <div className="tailor-card-header">
//                     <div className="tailor-avatar">
//                       {tailor.firstName ? tailor.firstName.charAt(0).toUpperCase() : 'T'}
//                     </div>
//                     <div className="tailor-info">
//                       <h3 className="tailor-name">
//                         {tailor.firstName || ''} {tailor.lastName || ''}
//                         {!tailor.firstName && !tailor.lastName && (tailor.name || 'Tailor')}
//                       </h3>
//                       {tailor.businessInfo?.businessName && (
//                         <p className="tailor-business">{tailor.businessInfo.businessName}</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="tailor-details">
//                     {tailor.phoneNumber && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
//                         </svg>
//                         <span>{tailor.phoneNumber}</span>
//                       </div>
//                     )}
                    
//                     {tailor.email && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                           <polyline points="22,6 12,13 2,6"/>
//                         </svg>
//                         <span>{tailor.email}</span>
//                       </div>
//                     )}

//                     {tailor.businessInfo?.address && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                           <circle cx="12" cy="10" r="3"/>
//                         </svg>
//                         <span>{tailor.businessInfo.address}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="tailor-footer">
//                     <button 
//                       className="tailor-select-btn"
//                       onClick={() => handleSelectTailor(tailor)}
//                     >
//                       Select Tailor
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {tailors.map((tailor) => (
//                 <div key={tailor.id || tailor._id} className="tailor-card">
//                   <div className="tailor-card-header">
//                     <div className="tailor-avatar">
//                       {tailor.firstName ? tailor.firstName.charAt(0).toUpperCase() : 'T'}
//                     </div>
//                     <div className="tailor-info">
//                       <h3 className="tailor-name">
//                         {tailor.firstName || ''} {tailor.lastName || ''}
//                         {!tailor.firstName && !tailor.lastName && (tailor.name || 'Tailor')}
//                       </h3>
//                       {tailor.businessInfo?.businessName && (
//                         <p className="tailor-business">{tailor.businessInfo.businessName}</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="tailor-details">
//                     {tailor.phoneNumber && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
//                         </svg>
//                         <span>{tailor.phoneNumber}</span>
//                       </div>
//                     )}
                    
//                     {tailor.email && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                           <polyline points="22,6 12,13 2,6"/>
//                         </svg>
//                         <span>{tailor.email}</span>
//                       </div>
//                     )}

//                     {tailor.businessInfo?.address && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                           <circle cx="12" cy="10" r="3"/>
//                         </svg>
//                         <span>{tailor.businessInfo.address}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="tailor-footer">
//                     <button 
//                       className="tailor-select-btn"
//                       onClick={() => handleSelectTailor(tailor)}
//                     >
//                       Select Tailor
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {tailors.map((tailor) => (
//                 <div key={tailor.id || tailor._id} className="tailor-card">
//                   <div className="tailor-card-header">
//                     <div className="tailor-avatar">
//                       {tailor.firstName ? tailor.firstName.charAt(0).toUpperCase() : 'T'}
//                     </div>
//                     <div className="tailor-info">
//                       <h3 className="tailor-name">
//                         {tailor.firstName || ''} {tailor.lastName || ''}
//                         {!tailor.firstName && !tailor.lastName && (tailor.name || 'Tailor')}
//                       </h3>
//                       {tailor.businessInfo?.businessName && (
//                         <p className="tailor-business">{tailor.businessInfo.businessName}</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="tailor-details">
//                     {tailor.phoneNumber && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
//                         </svg>
//                         <span>{tailor.phoneNumber}</span>
//                       </div>
//                     )}
                    
//                     {tailor.email && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                           <polyline points="22,6 12,13 2,6"/>
//                         </svg>
//                         <span>{tailor.email}</span>
//                       </div>
//                     )}

//                     {tailor.businessInfo?.address && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                           <circle cx="12" cy="10" r="3"/>
//                         </svg>
//                         <span>{tailor.businessInfo.address}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="tailor-footer">
//                     <button 
//                       className="tailor-select-btn"
//                       onClick={() => handleSelectTailor(tailor)}
//                     >
//                       Select Tailor
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {tailors.map((tailor) => (
//                 <div key={tailor.id || tailor._id} className="tailor-card">
//                   <div className="tailor-card-header">
//                     <div className="tailor-avatar">
//                       {tailor.firstName ? tailor.firstName.charAt(0).toUpperCase() : 'T'}
//                     </div>
//                     <div className="tailor-info">
//                       <h3 className="tailor-name">
//                         {tailor.firstName || ''} {tailor.lastName || ''}
//                         {!tailor.firstName && !tailor.lastName && (tailor.name || 'Tailor')}
//                       </h3>
//                       {tailor.businessInfo?.businessName && (
//                         <p className="tailor-business">{tailor.businessInfo.businessName}</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="tailor-details">
//                     {tailor.phoneNumber && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
//                         </svg>
//                         <span>{tailor.phoneNumber}</span>
//                       </div>
//                     )}
                    
//                     {tailor.email && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                           <polyline points="22,6 12,13 2,6"/>
//                         </svg>
//                         <span>{tailor.email}</span>
//                       </div>
//                     )}

//                     {tailor.businessInfo?.address && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                           <circle cx="12" cy="10" r="3"/>
//                         </svg>
//                         <span>{tailor.businessInfo.address}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="tailor-footer">
//                     <button 
//                       className="tailor-select-btn"
//                       onClick={() => handleSelectTailor(tailor)}
//                     >
//                       Select Tailor
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {tailors.map((tailor) => (
//                 <div key={tailor.id || tailor._id} className="tailor-card">
//                   <div className="tailor-card-header">
//                     <div className="tailor-avatar">
//                       {tailor.firstName ? tailor.firstName.charAt(0).toUpperCase() : 'T'}
//                     </div>
//                     <div className="tailor-info">
//                       <h3 className="tailor-name">
//                         {tailor.firstName || ''} {tailor.lastName || ''}
//                         {!tailor.firstName && !tailor.lastName && (tailor.name || 'Tailor')}
//                       </h3>
//                       {tailor.businessInfo?.businessName && (
//                         <p className="tailor-business">{tailor.businessInfo.businessName}</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="tailor-details">
//                     {tailor.phoneNumber && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
//                         </svg>
//                         <span>{tailor.phoneNumber}</span>
//                       </div>
//                     )}
                    
//                     {tailor.email && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                           <polyline points="22,6 12,13 2,6"/>
//                         </svg>
//                         <span>{tailor.email}</span>
//                       </div>
//                     )}

//                     {tailor.businessInfo?.address && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                           <circle cx="12" cy="10" r="3"/>
//                         </svg>
//                         <span>{tailor.businessInfo.address}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="tailor-footer">
//                     <button 
//                       className="tailor-select-btn"
//                       onClick={() => handleSelectTailor(tailor)}
//                     >
//                       Select Tailor
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {tailors.map((tailor) => (
//                 <div key={tailor.id || tailor._id} className="tailor-card">
//                   <div className="tailor-card-header">
//                     <div className="tailor-avatar">
//                       {tailor.firstName ? tailor.firstName.charAt(0).toUpperCase() : 'T'}
//                     </div>
//                     <div className="tailor-info">
//                       <h3 className="tailor-name">
//                         {tailor.firstName || ''} {tailor.lastName || ''}
//                         {!tailor.firstName && !tailor.lastName && (tailor.name || 'Tailor')}
//                       </h3>
//                       {tailor.businessInfo?.businessName && (
//                         <p className="tailor-business">{tailor.businessInfo.businessName}</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="tailor-details">
//                     {tailor.phoneNumber && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
//                         </svg>
//                         <span>{tailor.phoneNumber}</span>
//                       </div>
//                     )}
                    
//                     {tailor.email && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                           <polyline points="22,6 12,13 2,6"/>
//                         </svg>
//                         <span>{tailor.email}</span>
//                       </div>
//                     )}

//                     {tailor.businessInfo?.address && (
//                       <div className="tailor-detail-item">
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                           <circle cx="12" cy="10" r="3"/>
//                         </svg>
//                         <span>{tailor.businessInfo.address}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="tailor-footer">
//                     <button 
//                       className="tailor-select-btn"
//                       onClick={() => handleSelectTailor(tailor)}
//                     >
//                       Select Tailor
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TailorsList;

