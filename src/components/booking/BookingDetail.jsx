import React from 'react';

const BookingDetail = () => {
  const dummyBooking = {
    id: 'BK123456',
    status: 'Confirmed',
    tailor: {
      name: 'Rajesh Tailors',
      avatar: 'R',
      rating: 4.5
    },
    date: 'Dec 25, 2024',
    time: '10:00 - 10:30',
    mode: 'onsite',
    address: '123, Sample Street, Mumbai - 400001',
    cancellationPolicy: 'Free cancellation up to 24 hours before appointment'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
          <div className="flex items-center gap-2">
            <span className={`
              px-3 py-1 rounded-full text-sm font-semibold
              ${dummyBooking.status === 'Confirmed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
              }
            `}>
              {dummyBooking.status}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">Booking ID: {dummyBooking.id}</span>
          </div>
        </div>

        {/* Tailor Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tailor Information</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brown-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {dummyBooking.tailor.avatar}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{dummyBooking.tailor.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-gray-600">{dummyBooking.tailor.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold text-gray-900">{dummyBooking.date} • {dummyBooking.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Mode</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {dummyBooking.mode === 'onsite' ? 'Onsite' : 'At Shop'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">{dummyBooking.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
          <p className="text-sm text-blue-800">{dummyBooking.cancellationPolicy}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 py-4 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Reschedule
          </button>
          <button className="flex-1 py-4 px-6 rounded-lg border-2 border-red-300 text-red-700 font-semibold hover:bg-red-50 transition-colors">
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;





