import React, { useState, useEffect } from 'react';

const LookingForDriver = (props) => {
    const [searchTime, setSearchTime] = useState(0);
    const [searching, setSearching] = useState(true);
    const [nearbyDrivers, setNearbyDrivers] = useState(3);
    const [estimatedMatchTime, setEstimatedMatchTime] = useState('15-30 seconds');

    // Safely extract addresses
    const pickupAddress = typeof props.pickup === 'string' 
        ? props.pickup 
        : props.pickup?.address || 'Pickup location';

    const destinationAddress = typeof props.destination === 'string' 
        ? props.destination 
        : props.destination?.address || 'Destination';

    // Safely extract ride data
    const rideData = props.ride || {};
    const fareAmount = props.fare?.[props.vehicleType] || '--';

    useEffect(() => {
        const timer = setInterval(() => {
            setSearchTime(prev => prev + 1);
            
            // Simulate driver count changes
            if (searchTime % 5 === 0) {
                setNearbyDrivers(prev => {
                    const newCount = prev + (Math.random() > 0.5 ? 1 : -1);
                    return Math.max(1, Math.min(10, newCount));
                });
            }
            
            // Update estimated time
            if (searchTime % 10 === 0) {
                const times = ['10-20 seconds', '15-30 seconds', '20-40 seconds', '25-50 seconds'];
                const randomTime = times[Math.floor(Math.random() * times.length)];
                setEstimatedMatchTime(randomTime);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [searchTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const vehicleNames = {
        car: 'Car',
        moto: 'Moto',
        auto: 'Auto'
    };

    return (
        <div className="relative min-h-full px-4 py-6 sm:px-6 sm:py-8">
            {/* Header with Drag Handle */}
            <div className="sticky top-0 bg-white z-10 pb-4">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                            Finding Your Captain
                        </h3>
                        
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatTime(searchTime)}</div>
                        <div className="text-xs text-gray-500">Search time</div>
                    </div>
                </div>
            </div>

            {/* Animated Search Section */}
            <div className="relative m-8 bg-blue-900">
                {/* Pulsing Radar Animation */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                    {/* Outer circle pulses */}
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 border-4 border-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute inset-8 border-4 border-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                    
                    {/* Center car icon */}
                    <div className="absolute inset-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                        <i className="ri-car-line text-white text-3xl sm:text-4xl animate-bounce"></i>
                    </div>
                    
                    {/* Floating car icons */}
                    {[0, 1, 2].map((index) => (
                        <div 
                            key={index}
                            className="absolute w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center shadow-lg animate-float"
                            style={{
                                top: `${30 + 40 * Math.sin(index * 120 * Math.PI/180)}%`,
                                left: `${30 + 40 * Math.cos(index * 120 * Math.PI/180)}%`,
                                animationDelay: `${index * 0.5}s`,
                                animationDuration: '3s'
                            }}
                        >
                            <i className="ri-car-line text-white text-sm"></i>
                        </div>
                    ))}
                </div>

                {/* Status Indicators */}
                
            </div>

            {/* Trip Details Card */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
                

                {/* Route Details */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <i className="ri-map-pin-user-fill text-white text-xs"></i>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">PICKUP</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{pickupAddress}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                                <i className="ri-map-pin-2-fill text-white text-xs"></i>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">DESTINATION</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{destinationAddress}</p>
                        </div>
                    </div>
                </div>

                {/* OTP Display (if available) */}
                {rideData.otp && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                                    <i className="ri-shield-keyhole-line text-white"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">RIDE OTP</p>
                                    <p className="text-sm font-semibold text-gray-900">Share this with your driver</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 font-mono bg-amber-50 px-3 py-2 rounded-lg">
                                    {rideData.otp}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={() => props.setVehicleFound(false)}
                    className="group w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <i className="ri-close-line group-hover:rotate-90 transition-transform"></i>
                    Cancel Search
                </button>

            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes slideInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
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

export default LookingForDriver;