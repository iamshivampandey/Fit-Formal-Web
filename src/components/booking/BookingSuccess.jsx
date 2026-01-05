import React from 'react';

const BookingSuccess = ({ bookingData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your booking is confirmed!
        </h2>

        {/* Booking ID */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Booking ID</p>
          <p className="text-lg font-bold text-gray-900">{bookingData?.id || 'BK123456'}</p>
        </div>

        {/* Booking Details */}
        <div className="text-left space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold text-gray-900">
                {bookingData?.date?.toLocaleDateString() || 'Dec 25, 2024'} • {bookingData?.time || '10:00 - 10:30'}
              </p>
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
                {bookingData?.mode === 'onsite' ? 'Onsite' : 'At Shop'}
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
              <p className="font-semibold text-gray-900">
                123, Sample Street, Mumbai - 400001
              </p>
            </div>
          </div>
        </div>

        {/* Tailor Info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 mb-6">
          <div className="w-12 h-12 bg-brown-600 rounded-full flex items-center justify-center text-white font-bold">
            {bookingData?.tailorName?.charAt(0) || 'R'}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm text-gray-600">Tailor</p>
            <p className="font-semibold text-gray-900">{bookingData?.tailorName || 'Rajesh Tailors'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Add to Calendar
          </button>
          <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            View Booking
          </button>
          <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Message Tailor
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg bg-brown-600 text-white font-semibold hover:bg-brown-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;





