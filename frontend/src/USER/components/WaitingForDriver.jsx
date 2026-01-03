import React, { useState, useEffect } from 'react';

const WaitingForDriver = (props) => {
    const [eta, setEta] = useState('2-4 mins');
    const [driverDistance, setDriverDistance] = useState('1.5 km away');
    const [driverRating, setDriverRating] = useState(4.9);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isArriving, setIsArriving] = useState(false);

    // Safely access all properties with optional chaining and fallbacks
    const captainName = props.ride?.captain?.fullname ? 
        `${props.ride.captain.fullname.firstname} ${props.ride.captain.fullname.lastname}` : 
        'Driver arriving soon';

    const vehiclePlate = props.ride?.captain?.vehicle?.plate || 'Vehicle info';
    const vehicleModel = props.ride?.captain?.vehicle?.model || 'Maruti Suzuki Alto';
    const vehicleColor = props.ride?.captain?.vehicle?.color || 'White';
    
    const pickupAddress = typeof props.ride?.pickup === 'string' ? 
        props.ride.pickup : 
        props.ride?.pickup?.address || 'Pickup location';

    const destinationAddress = typeof props.ride?.destination === 'string' ? 
        props.ride.destination : 
        props.ride?.destination?.address || 'Destination';

    const fare = props.ride?.fare || 'Calculating...';
    const otp = props.ride?.otp || 'Waiting...';

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
            
            // Simulate ETA updates
            if (timeElapsed % 10 === 0) {
                const etas = ['2-4 mins', '1-3 mins', '3-5 mins', 'Arriving soon'];
                setEta(etas[Math.floor(Math.random() * etas.length)]);
            }
            
            // Simulate distance updates
            if (timeElapsed % 15 === 0) {
                const distances = ['1.5 km away', '1.2 km away', '0.8 km away', '0.5 km away', 'Nearby'];
                setDriverDistance(distances[Math.floor(Math.random() * distances.length)]);
            }
            
            // Check if arriving soon
            if (timeElapsed > 30) {
                setIsArriving(true);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeElapsed]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="relative min-h-full px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex justify-center mb-4">
                    <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full"></div>
                </div>
            {/* Header with Drag Handle */}
            {/* <div className="sticky top-0 bg-white z-10 pb-4">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                    <div>
                        
                        
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatTime(timeElapsed)}</div>
                        <div className="text-xs text-gray-500">Waiting time</div>
                    </div>
                </div>
            </div> */}

            {/* Driver Card with ETA */}
            <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-white to-gray-50 border border-gray-200 shadow-lg p-5">
                {/* Arrival Alert */}
                {isArriving && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2 px-4 text-center animate-pulse">
                        <i className="ri-alarm-warning-line mr-2"></i>
                        Driver arriving shortly!
                    </div>
                )}
                
                <div className={`flex items-start gap-4 ${isArriving ? 'pt-10' : ''}`}>
                    {/* Driver Avatar */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur opacity-20 animate-pulse"></div>
                        <img 
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-4 border-white shadow-lg relative z-10"
                            src="https://randomuser.me/api/portraits/men/32.jpg" 
                            alt="Driver" 
                        />
                        <div className="absolute -bottom-2 -right-2 z-20 bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            <i className="ri-star-fill mr-1"></i>
                            {driverRating}
                        </div>
                    </div>

                    {/* Driver Info */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 capitalize">
                                    {captainName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                        <i className="ri-car-line mr-1"></i>
                                        {vehicleModel}
                                    </span>
                                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        {vehicleColor}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {vehiclePlate}
                                </div>
                                <p className="text-xs text-gray-500">Vehicle number</p>
                            </div>
                        </div>

                        
                    </div>
                    
                </div>

             
            </div>

            {/* Trip Details */}
            <div className="space-y-4 mb-8">
                {/* Pickup Location */}
                <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        <i className="ri-map-pin-user-fill text-white text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Pickup Location</h4>
                        <p className="text-base font-semibold text-gray-900 truncate">{pickupAddress}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                                <i className="ri-time-line mr-1"></i>
                                Be ready in {eta}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Destination */}
                <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        <i className="ri-map-pin-2-fill text-white text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Destination</h4>
                        <p className="text-base font-semibold text-gray-900 truncate">{destinationAddress}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                                <i className="ri-road-map-line mr-1"></i>
                                5.2 km • 15 min ride
                            </span>
                        </div>
                    </div>
                </div>

                {/* Fare & OTP */}
                {/* <div className="grid grid-cols-2 gap-4">
                
                    <div className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-amber-300 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <i className="ri-currency-line text-white"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Fare</h4>
                                <p className="text-xl font-bold text-gray-900">₹{fare}</p>
                                <p className="text-xs text-gray-600">Pay to driver</p>
                            </div>
                        </div>
                    </div>

                
                    <div className="group bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200 hover:border-emerald-400 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <i className="ri-shield-keyhole-line text-white"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">OTP</h4>
                                <p className="text-xl font-bold text-gray-900 font-mono">{otp}</p>
                                <p className="text-xs text-gray-600">Share with driver</p>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Driver Actions */}
            {/* <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <i className="ri-information-line text-blue-500"></i>
                        Driver Information
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total trips</span>
                            <span className="font-medium text-gray-900">1,245 trips</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Response rate</span>
                            <span className="font-medium text-gray-900">98%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Joined</span>
                            <span className="font-medium text-gray-900">2022</span>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={() => props.setWaitingForDriver(false)}
                    className="group w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <i className="ri-arrow-down-line group-hover:translate-y-1 transition-transform"></i>
                    Minimize Panel
                </button>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        <i className="ri-information-line mr-1"></i>
                        Your driver will contact you upon arrival
                    </p>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes slideInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .animate-slideInUp {
                    animation: slideInUp 0.5s ease-out;
                }
                
                @media (max-width: 640px) {
                    .text-2xl { font-size: 1.5rem; }
                    .text-3xl { font-size: 1.875rem; }
                }
            `}</style>
        </div>
    );
};

export default WaitingForDriver;