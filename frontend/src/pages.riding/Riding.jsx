import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'
import LiveTracking from '../components/LiveTracking'

const Riding = () => {
    const location = useLocation()
    const { ride } = location.state || {} // Retrieve ride data
    const { socket } = useContext(SocketContext)
    const navigate = useNavigate()
    const [rideDuration, setRideDuration] = useState(0)
    const [remainingDistance, setRemainingDistance] = useState('-- km')
    const [estimatedArrival, setEstimatedArrival] = useState('-- min')

    useEffect(() => {
        // Ride duration timer
        const durationTimer = setInterval(() => {
            setRideDuration(prev => prev + 1)
        }, 1000)

        // Simulate distance updates
        const distanceTimer = setInterval(() => {
            const distances = ['8.2 km', '7.5 km', '6.9 km', '6.2 km', '5.5 km']
            const times = ['15 min', '13 min', '11 min', '9 min', '7 min']
            const randomIndex = Math.floor(Math.random() * 2) // Slight variation
            setRemainingDistance(distances[randomIndex] || '-- km')
            setEstimatedArrival(times[randomIndex] || '-- min')
        }, 10000) // Update every 10 seconds

        // Socket listener for ride ended
        const handleRideEnded = () => {
            navigate('/home')
        }

        socket.on("ride-ended", handleRideEnded)

        // Cleanup
        return () => {
            clearInterval(durationTimer)
            clearInterval(distanceTimer)
            socket.off("ride-ended", handleRideEnded)
        }
    }, [socket, navigate])

    // Safely access all properties with optional chaining and fallbacks
    const captainFirstName = ride?.captain?.fullname?.firstname || 'Driver'
    const captainLastName = ride?.captain?.fullname?.lastname || ''
    const vehiclePlate = ride?.captain?.vehicle?.plate || 'Vehicle info'
    const vehicleColor = ride?.captain?.vehicle?.color || ''
    const vehicleType = ride?.captain?.vehicle?.vehicleType || ''

    const destinationAddress = typeof ride?.destination === 'string' 
        ? ride.destination 
        : ride?.destination?.address || 'Destination'

    const pickupAddress = typeof ride?.pickup === 'string' 
        ? ride.pickup 
        : ride?.pickup?.address || 'Pickup'

    const fare = ride?.fare || 'Calculating...'

    // Format ride duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Get vehicle image based on type
    const getVehicleImage = () => {
        const vehicleType = ride?.vehicleType || 'car'
        switch(vehicleType) {
            case 'car':
                return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
            case 'moto':
                return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png"
            case 'auto':
                return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
            default:
                return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
        }
    }

    // Show loading state if no ride data
    if (!ride) {
        return (
            <div className='h-screen flex items-center justify-center bg-gray-900'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto'></div>
                    <p className='mt-4 text-gray-300'>Loading ride details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='h-screen bg-gray-900'>
            {/* Home Button */}
            <Link to='/home' className='fixed right-4 top-4 h-12 w-12 bg-gray-800 flex items-center justify-center rounded-full z-10 border border-gray-700 hover:bg-gray-700 transition-colors shadow-lg'>
                <i className="text-xl text-gray-300 font-medium ri-home-5-line"></i>
            </Link>
            
            {/* Top Stats Bar */}
            <div className='absolute top-4 left-4 z-10 bg-gray-800/90 backdrop-blur-sm p-3 rounded-xl border border-gray-700 shadow-lg'>
                <div className='flex items-center gap-4'>
                    <div className='text-center'>
                        <p className='text-xs text-gray-400'>Ride Time</p>
                        <p className='text-lg font-bold text-emerald-400'>{formatDuration(rideDuration)}</p>
                    </div>
                    <div className='h-8 w-px bg-gray-700'></div>
                    <div className='text-center'>
                        <p className='text-xs text-gray-400'>Distance</p>
                        <p className='text-lg font-bold text-emerald-400'>{remainingDistance}</p>
                    </div>
                    <div className='h-8 w-px bg-gray-700'></div>
                    <div className='text-center'>
                        <p className='text-xs text-gray-400'>Arrival</p>
                        <p className='text-lg font-bold text-emerald-400'>{estimatedArrival}</p>
                    </div>
                </div>
            </div>
            
            {/* Live Tracking Map */}
            <div className='h-1/2 relative'>
                <LiveTracking />
                {/* Map Overlay Controls */}
                <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm p-3 rounded-xl border border-gray-700'>
                    <div className='flex items-center gap-4'>
                        <button className='w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition-colors'>
                            <i className="ri-navigation-fill text-gray-300"></i>
                        </button>
                        <button className='w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition-colors'>
                            <i className="ri-volume-up-line text-gray-300"></i>
                        </button>
                        <button className='w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition-colors'>
                            <i className="ri-fullscreen-fill text-gray-300"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Ride Details Panel */}
            <div className='h-1/2 p-6 bg-gray-800 rounded-t-3xl shadow-2xl border-t border-gray-700'>
                {/* Driver & Vehicle Info */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-4'>
                        <div className='relative'>
                            <img 
                                className='h-16 w-20 object-cover rounded-xl border-2 border-emerald-500/50 shadow-lg' 
                                src={getVehicleImage()} 
                                alt="Vehicle" 
                            />
                            <div className='absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse'>
                                <i className="ri-pulse-line text-sm text-gray-900"></i>
                            </div>
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <div className='w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center'>
                                    <i className="ri-user-3-fill text-gray-900"></i>
                                </div>
                                <div>
                                    <h2 className='text-lg font-bold text-gray-100 capitalize'>
                                        {captainFirstName} {captainLastName}
                                    </h2>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <span className='text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full'>4.8 ★</span>
                                        <span className='text-xs text-gray-400'>• {vehiclePlate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className='text-right'>
                        <div className='flex flex-col items-end gap-2'>
                            <div className='bg-gray-900/70 px-3 py-2 rounded-lg border border-gray-700'>
                                <p className='text-xs text-gray-400'>Vehicle</p>
                                <p className='text-sm font-semibold text-gray-300'>{vehicleColor} {vehicleType}</p>
                            </div>
                            <button className='w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700 hover:bg-gray-800 transition-colors'>
                                <i className="ri-phone-line text-gray-300"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trip Details */}
                <div className='space-y-4 mb-6'>
                    <div className='flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700'>
                        <div className='w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-700/50'>
                            <i className="ri-map-pin-user-fill text-emerald-400 text-xl"></i>
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-base font-medium text-gray-300'>Pickup Location</h3>
                            <p className='text-sm mt-1 text-gray-400 truncate'>{pickupAddress}</p>
                        </div>
                        <div className='text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full'>
                            <i className="ri-check-line mr-1"></i>Picked up
                        </div>
                    </div>

                    <div className='flex items-center gap-4 p-4 bg-emerald-900/20 rounded-xl border border-emerald-800/50'>
                        <div className='w-12 h-12 bg-emerald-800/50 rounded-full flex items-center justify-center border border-emerald-700/50'>
                            <i className="ri-map-pin-2-fill text-emerald-400 text-xl"></i>
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-base font-medium text-emerald-300'>Destination</h3>
                            <p className='text-sm mt-1 text-gray-300 truncate'>{destinationAddress}</p>
                            <div className='flex items-center gap-3 mt-2'>
                                <span className='text-xs text-emerald-400 flex items-center gap-1'>
                                    <i className="ri-road-map-line"></i>
                                    {remainingDistance} left
                                </span>
                                <span className='text-xs text-emerald-400 flex items-center gap-1'>
                                    <i className="ri-time-line"></i>
                                    {estimatedArrival} to go
                                </span>
                            </div>
                        </div>
                        <div className='text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full'>
                            In progress
                        </div>
                    </div>

                    <div className='flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700'>
                        <div className='w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700'>
                            <i className="ri-currency-line text-gray-400 text-xl"></i>
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-base font-medium text-gray-300'>Trip Fare</h3>
                            <p className='text-2xl font-bold mt-1 text-emerald-400'>₹{fare}</p>
                            <p className='text-xs text-gray-500 mt-1'>Payable at destination</p>
                        </div>
                        <div className='text-right'>
                            <div className='text-xs text-gray-400 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700'>
                                Cash Payment
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className='flex gap-3'>
                    <button className='flex-1 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 font-medium p-4 rounded-xl border border-gray-700 transition-all duration-300 flex items-center justify-center gap-2'>
                        <i className="ri-chat-1-line"></i>
                        Message Driver
                    </button>
                    <button className='flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold p-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2'>
                        <i className="ri-bank-card-line"></i>
                        Pay ₹{fare}
                    </button>
                </div>

                {/* Ride Status Footer */}
                <div className='mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='w-3 h-3 bg-emerald-400 rounded-full animate-pulse'></div>
                            <div>
                                <p className='text-sm text-emerald-400 font-medium'>Ride in progress</p>
                                <p className='text-xs text-gray-500 mt-1'>You'll reach in {estimatedArrival}</p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <p className='text-xs text-gray-400'>Ride ID: <span className='text-emerald-400'>{ride._id?.slice(-8) || 'N/A'}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Riding