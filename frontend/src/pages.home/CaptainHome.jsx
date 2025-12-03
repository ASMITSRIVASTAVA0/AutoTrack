import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import LiveTracking from '../components/LiveTracking'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { useEffect, useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

const CaptainHome = () => {

    const [ ridePopupPanel, setRidePopupPanel ] = useState(false)
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false)
    const [ isOnline, setIsOnline ] = useState(true)
    const [ captainLocation, setCaptainLocation ] = useState(null)

    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)

    const [ ride, setRide ] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)

    useEffect(() => {
        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })
        
        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    
                    setCaptainLocation(location)
                    
                    socket.emit('update-location-captain', {
                        userId: captain._id,
                        location: location
                    });
                    
                    console.log('Location updated:', location);
                }, (error) => {
                    console.error('Error getting location:', error);
                });
            }
        };

        const locationInterval = setInterval(updateLocation, 10000) // Update every 10 seconds
        updateLocation()

        return () => clearInterval(locationInterval)
    }, [])

    socket.on('new-ride', (data) => {
        setRide(data)
        setRidePopupPanel(true)
    })

    async function confirmRide() {
        console.log("Confirming ride for ride", ride);
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
            rideId: ride._id,
            captainId: captain._id,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        setRidePopupPanel(false)
        setConfirmRidePopupPanel(true)
    }

    useGSAP(function () {
        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ ridePopupPanel ])

    useGSAP(function () {
        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePopupPanel ])

    return (
        <div className='h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden'>
            {/* Header */}
            <div className='fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200'>
                <div className='p-6 flex items-center justify-between'>
                    {/* Logo */}
                    <div className='flex items-center gap-2'>
                        <div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
                            <img className='w-8' src="/autotracklogo.png" alt="AutoTrack" />
                        </div>
                        <div>
                            <p className='text-xs text-gray-500'>AutoTrack</p>
                            <p className='text-sm font-semibold text-gray-900'>Driver</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className='flex items-center gap-3'>
                        <button 
                            onClick={() => setIsOnline(!isOnline)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                                isOnline 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-gray-500'} animate-pulse`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </button>

                        {/* Logout Button */}
                        <Link 
                            to='/role' 
                            className='h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/50 text-white'
                        >
                            <i className="text-lg ri-logout-box-r-line"></i>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            
            <div className='h-3/5 mt-24 relative overflow-hidden rounded-b-3xl shadow-lg'>
                {captainLocation ? (
                    <LiveTracking captainLocation={captainLocation} />
                ) : (
                    <div className='w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
                        <div className='text-center text-white'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
                            <p className='font-semibold'>Getting your location...</p>
                        </div>
                    </div>
                )}

                    {/* <div className='w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
                        <div className='text-center text-white'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
                            <p className='font-semibold'>Getting your location...</p>
                        </div>
                    </div> */}

                {/* Live Badge */}
                <div className='absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-20'>
                    <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
                    <span className='text-sm font-semibold'>Live</span>
                </div>
            </div>

            {/* Captain Details Section */}
            <div className='h-2/5 bg-white rounded-t-3xl shadow-2xl overflow-auto'>
                <div className='p-6 space-y-4'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h2 className='text-2xl font-bold text-gray-900'>Welcome Back!</h2>
                            <p className='text-sm text-gray-500 mt-1'>Ready to accept rides</p>
                        </div>
                        <div className='text-right'>
                            <p className='text-3xl font-bold text-blue-600'>4.9</p>
                            <p className='text-xs text-gray-500 flex items-center justify-end gap-1'>
                                <i className="ri-star-fill text-yellow-400"></i>
                                Rating
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className='grid grid-cols-3 gap-3 mb-6'>
                        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200'>
                            <p className='text-2xl font-bold text-blue-600'>12</p>
                            <p className='text-xs text-gray-600 mt-1'>Rides Today</p>
                        </div>
                        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200'>
                            <p className='text-2xl font-bold text-green-600'>$245</p>
                            <p className='text-xs text-gray-600 mt-1'>Earnings</p>
                        </div>
                        <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200'>
                            <p className='text-2xl font-bold text-purple-600'>2.4h</p>
                            <p className='text-xs text-gray-600 mt-1'>Online</p>
                        </div>
                    </div>

                    {/* Captain Details Component */}
                    <CaptainDetails />

                    {/* Action Buttons */}
                    <div className='grid grid-cols-2 gap-3 pt-4 border-t border-gray-200'>
                        <button className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50'>
                            <i className="ri-phone-line"></i>
                            Call Support
                        </button>
                        <button className='bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2'>
                            <i className="ri-history-line"></i>
                            History
                        </button>
                    </div>
                </div>
            </div>

            {/* Ride Popup */}
            <div 
                ref={ridePopupPanelRef} 
                className='fixed w-full z-50 bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl overflow-hidden'
            >
                <div className='p-6 pt-8'>
                    {/* Drag Handle */}
                    <div className='flex justify-center mb-4'>
                        <div className='w-12 h-1 bg-gray-300 rounded-full'></div>
                    </div>
                    <RidePopUp
                        ride={ride}
                        setRidePopupPanel={setRidePopupPanel}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                        confirmRide={confirmRide}
                    />
                </div>
            </div>

            {/* Confirm Ride Popup */}
            <div 
                ref={confirmRidePopupPanelRef} 
                className='fixed w-full h-screen z-50 bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl overflow-auto'
            >
                <div className='p-6 pt-8'>
                    {/* Drag Handle */}
                    <div className='flex justify-center mb-4'>
                        <div className='w-12 h-1 bg-gray-300 rounded-full'></div>
                    </div>
                    <ConfirmRidePopUp
                        ride={ride}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel} 
                        setRidePopupPanel={setRidePopupPanel} 
                    />
                </div>
            </div>
        </div>
    )
}

export default CaptainHome