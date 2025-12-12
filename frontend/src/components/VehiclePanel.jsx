import React, { useState, useEffect } from 'react';

const VehiclePanel = (props) => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState({ car: '2 mins', moto: '1 min', auto: '3 mins' });
    const [estimatedDistance, setEstimatedDistance] = useState('5.2 km');
    const [savings, setSavings] = useState({
        car: 'Standard',
        moto: 'Save 40%',
        auto: 'Save 25%'
    });

    // Define vehicle data
    const vehicles = [
        {
            id: 'car',
            name: 'Car',
            icon: 'ri-car-line',
            seats: '4',
            time: estimatedTime.car,
            description: 'Affordable, compact rides',
            image: 'https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg',
            price: props.fare?.car || '--',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            features: ['AC Available', 'Spacious', '4 Seats'],
            savings: savings.car,
            popularity: 'High'
        },
        {
            id: 'moto',
            name: 'Moto',
            icon: 'ri-motorbike-line',
            seats: '1',
            time: estimatedTime.moto,
            description: 'Affordable motorcycle rides',
            image: 'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png',
            price: props.fare?.moto || '--',
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-gradient-to-br from-emerald-500 to-green-500',
            features: ['Fastest', 'Economical', '1 Seat'],
            savings: savings.moto,
            popularity: 'Medium'
        },
        {
            id: 'auto',
            name: 'Auto',
            icon: 'ri-taxi-line',
            seats: '3',
            time: estimatedTime.auto,
            description: 'Affordable Auto rides',
            image: 'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png',
            price: props.fare?.auto || '--',
            color: 'from-amber-500 to-yellow-500',
            bgColor: 'bg-gradient-to-br from-amber-500 to-yellow-500',
            features: ['Open Air', 'Budget Friendly', '3 Seats'],
            savings: savings.auto,
            popularity: 'Low'
        }
    ];

    const handleVehicleSelect = (vehicleId) => {
        setSelectedVehicle(vehicleId);
        props.selectVehicle(vehicleId);
        
        // Add selection animation feedback
        const vehicleCard = document.querySelector(`[data-vehicle="${vehicleId}"]`);
        if (vehicleCard) {
            vehicleCard.classList.add('animate-pulse-once');
            setTimeout(() => {
                vehicleCard.classList.remove('animate-pulse-once');
            }, 300);
        }
        
        // Open confirm panel
        setTimeout(() => {
            props.setConfirmRidePanel(true);
        }, 300);
    };

    // Custom CSS for animations
    const styles = `
        @keyframes pulseOnce {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .animate-pulse-once {
            animation: pulseOnce 0.3s ease-in-out;
        }
        
        @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-slideInUp {
            animation: slideInUp 0.5s ease-out;
        }
    `;

    return (
        <div className="relative h-full">
            <style>{styles}</style>

            {/* Drag Handle */}
            <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full"></div>
            </div>
            <br/>

            {/* Vehicle Options */}
            <div className="space-y-3 sm:space-y-4 m-6">
                {vehicles.map((vehicle, index) => (
                    <div
                        key={vehicle.id}
                        data-vehicle={vehicle.id}
                        onClick={() => handleVehicleSelect(vehicle.id)}
                        className={`group relative bg-gradient-to-r from-white to-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-95 animate-slideInUp ${
                            selectedVehicle === vehicle.id
                                ? `border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg`
                                : 'border-gray-200 hover:border-blue-300'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Savings Badge */}
                        {vehicle.savings !== 'Standard' && (
                            <div className="absolute -top-2 left-3 z-10">
                                <div className={`relative px-2 py-1 rounded-full text-white text-xs font-bold ${vehicle.bgColor} shadow-lg`}>
                                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-50"></div>
                                    <span className="relative z-10">{vehicle.savings}</span>
                                </div>
                            </div>
                        )}

                        {/* Selection Indicator */}
                        {selectedVehicle === vehicle.id && (
                            <div className="absolute -top-2 -right-2 z-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-md animate-ping"></div>
                                    <div className="relative w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                                        <i className="ri-check-line text-white text-xs sm:text-sm"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3 sm:gap-5">
                            {/* Vehicle Image */}
                            <div className="relative flex-shrink-0">
                                <div className={`absolute inset-0 ${vehicle.bgColor} rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                                <img
                                    className="h-14 w-14 sm:h-20 sm:w-20 object-cover rounded-lg sm:rounded-xl relative z-10 shadow-lg group-hover:scale-105 transition-transform"
                                    src={vehicle.image}
                                    alt={vehicle.name}
                                />
                                <div className="absolute -bottom-1 -right-1 z-20">
                                    <div className="bg-gradient-to-br from-gray-900 to-black text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                                        <i className="ri-user-3-fill text-xs"></i>
                                        <span className="font-medium">{vehicle.seats}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                {vehicle.name}
                                            </h3>
                                            <span className={`w-2 h-2 rounded-full ${vehicle.bgColor}`}></span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">{vehicle.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                                            ₹{vehicle.price}
                                        </p>
                                        <p className="text-xs text-gray-500">Estimated fare</p>
                                    </div>
                                </div>

                              

                                {/* Bottom Row: Time & Popularity */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-1 ${vehicle.bgColor} text-white text-xs rounded-full flex items-center gap-1 shadow-md`}>
                                            <i className="ri-time-line"></i>
                                            <span>{vehicle.time}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <i className="ri-fire-line"></i>
                                            <span>{vehicle.popularity} demand</span>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 text-xs sm:text-sm font-medium flex items-center gap-1 group-hover:text-blue-700">
                                        Select
                                        <i className="ri-arrow-right-s-line group-hover:translate-x-1 transition-transform"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Hover Effect Line */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 space-y-3 animate-slideInUp" style={{ animationDelay: '300ms' }}>
                <div className="flex gap-2">
                    <button
                        onClick={() => props.setVehiclePanel(false)}
                        className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <i className="ri-arrow-left-line"></i>
                        Back
                    </button>
                    
                    <button
                        onClick={() => selectedVehicle && handleVehicleSelect(selectedVehicle)}
                        disabled={!selectedVehicle}
                        className={`flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                            selectedVehicle
                                ? 'hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:scale-105 active:scale-95'
                                : 'opacity-50 cursor-not-allowed'
                        }`}
                    >
                        Continue
                        <i className="ri-arrow-right-line"></i>
                    </button>
                </div>
                <br/>

                
            </div>
        </div>
    );
};

export default VehiclePanel;