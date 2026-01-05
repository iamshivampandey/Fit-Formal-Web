import React from 'react';

const TailorList = () => {
  const dummyTailors = [
    {
      id: 1,
      name: 'Rajesh Tailors',
      image: '/placeholder-tailor.jpg',
      rating: 4.5,
      city: 'Mumbai',
      experience: '10 years',
      priceRange: '₹500 - ₹2000',
      isActive: true
    },
    {
      id: 2,
      name: 'Premium Stitching',
      image: '/placeholder-tailor.jpg',
      rating: 4.8,
      city: 'Delhi',
      experience: '15 years',
      priceRange: '₹800 - ₹3000',
      isActive: true
    },
    {
      id: 3,
      name: 'Elite Tailoring',
      image: '/placeholder-tailor.jpg',
      rating: 4.2,
      city: 'Bangalore',
      experience: '8 years',
      priceRange: '₹600 - ₹2500',
      isActive: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Tailors</h1>
          <p className="mt-2 text-gray-600">Choose from our verified tailors</p>
        </div>

        {/* Tailor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyTailors.map((tailor) => (
            <div
              key={tailor.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                // Navigate to TailorProfile
                console.log('Navigate to tailor profile:', tailor.id);
              }}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Active Badge */}
                {tailor.isActive && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Active
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tailor.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{tailor.rating}</span>
                  <span className="text-sm text-gray-500">(120 reviews)</span>
                </div>

                {/* City */}
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">{tailor.city}</span>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">{tailor.experience} experience</span>
                </div>

                {/* Price Range */}
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">{tailor.priceRange}</span>
                </div>

                {/* View Profile Button */}
                <button className="w-full bg-brown-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-brown-700 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TailorList;





