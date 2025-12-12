import React, { useState, useEffect } from 'react';

const ConfirmRide = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tripDetails] = useState({
    eta: '2-4 mins',
    distance: '5.2 km',
    duration: '15-20 mins'
  });
  const [fareBreakdown, setFareBreakdown] = useState({
    baseFare: 0,
    distanceCharge: 0,
    serviceFee: 0,
    total: 0
  });

  // Safely extract addresses
  const pickupAddress = typeof props.pickup === 'string' ? props.pickup : props.pickup?.address || 'Pickup location';
  const destinationAddress = typeof props.destination === 'string' ? props.destination : props.destination?.address || 'Destination';
  const fareAmount = props.fare?.[props.vehicleType] || '--';

  useEffect(() => {
    const total = parseFloat(fareAmount) || 0;
    const baseFare = Math.round(total * 0.4);
    const distanceCharge = Math.round(total * 0.4);
    const serviceFee = Math.round(total * 0.2);
    setFareBreakdown({ baseFare, distanceCharge, serviceFee, total });
  }, [fareAmount]);

  const vehicleImages = {
    car: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    moto: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400&h=300&fit=crop',
    auto: 'https://images.unsplash.com/photo-1593941707882-a5bba53306fe?w-400&h=300&fit=crop'
  };

  const vehicleNames = {
    car: 'Premium Car',
    moto: 'Moto Bike',
    auto: 'Auto Rickshaw'
  };

  const vehicleIcons = {
    car: '🚗',
    moto: '🏍️',
    auto: '🛺'
  };

  const vehicleCapacity = {
    car: '4',
    moto: '1',
    auto: '3'
  };

  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await props.createRide();
      props.setVehicleFound(true);
      props.setConfirmRidePanel(false);
    } catch (error) {
      console.error("Error creating ride:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white z-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Confirm Ride</h1>
            <p className="text-sm text-gray-500 mt-1">Review details before booking</p>
          </div>
          <button
            onClick={() => props.setConfirmRidePanel(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-260px)] overflow-y-auto px-6">
        {/* Vehicle Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-3xl">{vehicleIcons[props.vehicleType]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{vehicleNames[props.vehicleType]}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {vehicleCapacity[props.vehicleType]} seats
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {tripDetails.distance}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">₹{fareAmount}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    ETA: {tripDetails.eta}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Route Details
          </h3>
          
          <div className="relative pl-8">
            {/* Vertical Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-red-400"></div>
            
            {/* Pickup Point */}
            <div className="relative mb-8">
              <div className="absolute left-[-26px] top-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">PICKUP</p>
                <p className="text-gray-900 font-medium">{pickupAddress}</p>
              </div>
            </div>

            {/* Destination Point */}
            <div className="relative">
              <div className="absolute left-[-26px] top-0 w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-md"></div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">DESTINATION</p>
                <p className="text-gray-900 font-medium">{destinationAddress}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-semibold text-gray-900">{tripDetails.distance}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-semibold text-gray-900">{tripDetails.duration}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Ride Type</p>
                <p className="font-semibold text-blue-600">{vehicleNames[props.vehicleType]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Fare Breakdown
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Base fare</span>
              <span className="font-medium">₹{fareBreakdown.baseFare}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Distance charge</span>
              <span className="font-medium">₹{fareBreakdown.distanceCharge}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Service fee</span>
              <span className="font-medium">₹{fareBreakdown.serviceFee}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Total amount</p>
                  <p className="text-xs text-gray-500 mt-1">Cash to pay to driver</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">₹{fareBreakdown.total}</p>
                  <p className="text-xs text-green-600 mt-1">Inclusive of all taxes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing your booking...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm & Book Ride
              </span>
            )}
          </button>
          
          <button
            onClick={() => props.setConfirmRidePanel(false)}
            className="w-full bg-gray-50 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to vehicle selection
            </span>
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default ConfirmRide;