import React, { useState, useEffect } from 'react'

const LookingForDriver = (props) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    
    // Safely extract addresses
    const pickupAddress = typeof props.pickup === 'string' 
        ? props.pickup 
        : props.pickup?.address || '';

    const destinationAddress = typeof props.destination === 'string' 
        ? props.destination 
        : props.destination?.address || '';

    // Safely extract ride data
    const rideData = props.ride || {};

    // Timer for elapsed time
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format elapsed time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get vehicle image based on type
    const getVehicleImage = () => {
        switch(props.vehicleType) {
            case 'car':
                return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg";
            case 'moto':
                return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png";
            case 'auto':
                return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png";
            default:
                return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg";
        }
    };

    return (
        <div className='text-gray-100'>
            <h5 
                className='p-1 text-center w-[93%] absolute top-0' 
                onClick={() => {
                    props.setVehicleFound(false)
                }}>
                <i className="text-3xl text-gray-400 hover:text-gray-200 ri-arrow-down-wide-line transition-colors cursor-pointer"></i>
            </h5>
            
            <div className='text-center'>
                <div className='flex items-center justify-between mb-4'>
                    <div className='text-left'>
                        <h1 className='text-2xl font-bold text-gray-100'>Looking for Driver</h1>
                        <p className='text-sm text-gray-400 mt-1'>
                            <i className="ri-time-line mr-1"></i>
                            Searching for {formatTime(elapsedTime)}
                        </p>
                    </div>
                    <div className='flex items-center gap-2 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-700/50'>
                        <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
                        <span className='text-sm text-emerald-300'>Live Search</span>
                    </div>
                </div>
                
                <div className='flex flex-col items-center justify-center py-6'>
                    <div className='relative'>
                        <div className='w-24 h-24 rounded-full bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 border-4 border-emerald-800/50 flex items-center justify-center animate-pulse'>
                            <i className="ri-car-line text-5xl text-emerald-400"></i>
                        </div>
                        <div className='absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce'>
                            <i className="ri-search-eye-line text-lg text-gray-900"></i>
                        </div>
                        <div className='absolute -bottom-2 -left-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center'>
                            <span className='text-xs font-bold text-gray-900'>{props.vehicleType === 'car' ? '4' : props.vehicleType === 'auto' ? '3' : '1'}</span>
                        </div>
                    </div>
                    
                    <div className='mt-6 w-full max-w-xs'>
                        <div className='flex items-center justify-center gap-3'>
                            {[1, 2, 3, 4, 5].map((dot) => (
                                <div 
                                    key={dot}
                                    className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'
                                    style={{ animationDelay: `${dot * 0.2}s` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className='mt-8 text-left space-y-3'>
                    <div className='flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-800/70 transition-colors'>
                        <div className='w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-700/50'>
                            <i className="ri-map-pin-user-fill text-emerald-400"></i>
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-base font-medium text-gray-300'>Pickup Location</h3>
                            <p className='text-sm mt-1 text-gray-400 truncate'>{pickupAddress}</p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-800/70 transition-colors'>
                        <div className='w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-700/50'>
                            <i className="ri-map-pin-2-fill text-emerald-400"></i>
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-base font-medium text-gray-300'>Destination</h3>
                            <p className='text-sm mt-1 text-gray-400 truncate'>{destinationAddress}</p>
                        </div>
                    </div>
                    
                    {rideData.otp && (
                        <div className='flex items-center gap-4 p-4 bg-emerald-900/20 rounded-xl border border-emerald-800/50 hover:bg-emerald-900/30 transition-colors'>
                            <div className='w-10 h-10 bg-emerald-800/50 rounded-full flex items-center justify-center border border-emerald-700/50'>
                                <i className="ri-shield-keyhole-line text-emerald-400"></i>
                            </div>
                            <div className='flex-1'>
                                <h3 className='text-base font-medium text-emerald-300'>Ride OTP</h3>
                                <p className='text-lg font-bold mt-1 text-emerald-400 tracking-wider'>{rideData.otp}</p>
                                <p className='text-xs text-emerald-500/80 mt-1'>Share this with driver to start ride</p>
                            </div>
                        </div>
                    )}
                    
                    <div className='flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700'>
                        <div className='w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700'>
                            <i className="ri-currency-line text-gray-400"></i>
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-base font-medium text-gray-300'>Fare Estimate</h3>
                            <p className='text-xl font-bold mt-1 text-emerald-400'>₹{props.fare[props.vehicleType] || '--'}</p>
                        </div>
                        <img 
                            className='w-16 h-12 object-cover rounded-lg border border-emerald-700/50' 
                            src={getVehicleImage()} 
                            alt="Vehicle" 
                        />
                    </div>
                </div>
                
                <div className='mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-center gap-2 mb-2'>
                        <i className="ri-information-line text-emerald-400"></i>
                        <p className='text-sm text-gray-400 text-center'>
                            We're searching for the best driver near your location...
                        </p>
                    </div>
                    <div className='flex items-center justify-between text-xs text-gray-500'>
                        <span>• Matching with drivers</span>
                        <span>• Checking availability</span>
                        <span>• Confirming ride</span>
                    </div>
                </div>
                
                <button
                    onClick={() => {
                        props.setVehicleFound(false)
                    }}
                    className='w-full mt-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 font-medium p-3 rounded-xl border border-gray-700 transition-all duration-300 flex items-center justify-center gap-2'
                >
                    <i className="ri-close-line"></i>
                    Cancel Search
                </button>
            </div>
        </div>
    )
}

export default LookingForDriver