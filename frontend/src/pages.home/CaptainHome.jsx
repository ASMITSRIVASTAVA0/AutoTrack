
import React, { useRef, useState, useEffect, useContext, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/compo.captain/ConfirmRidePopUp'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

// Lazy load components for better performance
import LiveTracking from '../pages.riding/LiveTracking';
import RidePopUp from '../components/compo.captain/RidePopUp';

import CaptainProfile from '../components/compo.captain.info/CaptainProfile';
import RideHistory from '../components/compo.captain.info/RideHistory';
import Earnings from '../components/compo.captain.info/Earnings';
import  Support from '../components/compo.captain.info/Support';
import CaptainDetails from '../components/compo.captain/CaptainDetails';

const CaptainHome = () => {
    const [mounted, setMounted] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [parallaxLayers, setParallaxLayers] = useState([])
    const [ridePopupPanel, setRidePopupPanel] = useState(false)
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)
    const [isOnline, setIsOnline] = useState(true)
    const [captainLocation, setCaptainLocation] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [stats, setStats] = useState({
        ridesToday: 12,
        earnings: 245,
        onlineTime: '2.4h',
        rating: 4.9
    })
    const [pulseAnimation, setPulseAnimation] = useState(false)
    const [activeSection, setActiveSection] = useState('profile')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const [ride, setRide] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100)
        
        const layers = []
        for (let i = 0; i < 12; i++) {
            layers.push({
                id: i,
                size: Math.random() * 50 + 20,
                x: Math.random() * 100,
                y: Math.random() * 100,
                speed: Math.random() * 0.2 + 0.1,
                delay: Math.random() * 5
            })
        }
        setParallaxLayers(layers)
        
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])


    // THIS USEEFFECT HAS MAP UPDATE LOGIC

    // useEffect(() => {
    //     socket.emit('join', {
    //         userId: captain._id,
    //         userType: 'captain'
    //     })
        
    //     const updateLocation = () => {
    //         if (navigator.geolocation) {
    //             navigator.geolocation.getCurrentPosition(position => {
    //                 const location = {
    //                     lat: position.coords.latitude,
    //                     lng: position.coords.longitude
    //                 }
                    
    //                 setCaptainLocation(location)
                    
    //                 // socket.emit('update-location-captain', {
    //                 //     userId: captain._id,
    //                 //     location: location
    //                 // });
                    
    //                 setPulseAnimation(true)
    //                 setTimeout(() => setPulseAnimation(false), 1000)
                    
    //                 addNotification('Location updated', 'info')
    //             }, (error) => {
    //                 console.error('Error getting location:', error);
    //                 addNotification('Error getting location', 'error')
    //             });
    //         }
    //     };

    //     const locationInterval = setInterval(updateLocation, 2000);
    //     updateLocation()

    //     return () => clearInterval(locationInterval)
    // }, [])

    // In CaptainHome.jsx, replace the socket connection effect:

    useEffect(() => {
        if (!socket || !captain?._id) return;

        // Handle socket reconnection
        const handleConnect = () => {
            console.log('Socket reconnected, rejoining captain room');
            socket.emit('join', {
                userId: captain._id,
                userType: 'captain'
            });
        };

        // Join on initial connection or reconnection
        const joinRoom = () => {
            socket.emit('join', {
                userId: captain._id,
                userType: 'captain'
            });
        };

        // Listen for connection events
        socket.on('connect', handleConnect);
        
        // Initial join
        if (socket.connected) {
            joinRoom();
        }

        // Set up location update
        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    setCaptainLocation(location);
                    
                    // Only emit location if socket is connected
                    if (socket && socket.connected) {
                        // socket.emit('update-location-captain', {
                        //     userId: captain._id,
                        //     location: location
                        // });
                    }
                    
                    setPulseAnimation(true);
                    setTimeout(() => setPulseAnimation(false), 1000);
                    addNotification('Location updated', 'info');
                }, (error) => {
                    console.error('Error getting location:', error);
                    addNotification('Error getting location', 'error');
                });
            }
        };

        const locationInterval = setInterval(updateLocation, 2000);
        updateLocation();

        // Cleanup
        return () => {
            clearInterval(locationInterval);
            socket.off('connect', handleConnect);
            socket.off('new-ride');
        };
    }, [socket, captain]);

    socket.on('new-ride', (data) => {
        setRide(data)
        setRidePopupPanel(true)
        addNotification('🚗 New ride request received!', 'success', true)
        
        // const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3')
        // audio.volume = 0.3
        // audio.play().catch(e => console.log('Audio play failed:', e))
    })

    const addNotification = (message, type = 'info', urgent = false) => {
        // const id = Date.now();
        // const notification = { 
        //     id, 
        //     message, 
        //     type, 
        //     timestamp: new Date(),
        //     urgent,
        //     read: false
        // };
        
        // // setNotifications(prev => [notification, ...prev]);
        
        // if (!urgent) {
        //     setTimeout(() => {
        //         setNotifications(prev => prev.filter(notification => notification.id !== id));
        //     }, 5000);
        // }
    }

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }

    async function confirmRide() {
        console.log("Confirming ride for ride", ride);
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
            rideId: ride._id,
            captainId: captain._id,
        }, {
            headers: {
                // Authorization: `Bearer ${localStorage.getItem('token')}`
                Authorization: `Bearer ${localStorage.getItem('tokenCaptain')}`
            }
        })

        setRidePopupPanel(false)
        setConfirmRidePopupPanel(true)
        
        setStats(prev => ({
            ...prev,
            ridesToday: prev.ridesToday + 1,
            earnings: prev.earnings + (ride.estimatedFare || 50)
        }))
        
        addNotification('Ride confirmed successfully!', 'success')
    }

    useGSAP(function () {
        if (ridePopupPanel) {
            gsap.fromTo(ridePopupPanelRef.current, 
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            )
        } else {
            gsap.to(ridePopupPanelRef.current, {
                y: "100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            })
        }
    }, [ ridePopupPanel ])

    useGSAP(function () {
        if (confirmRidePopupPanel) {
            gsap.fromTo(confirmRidePopupPanelRef.current, 
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            )
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                y: "100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            })
        }
    }, [ confirmRidePopupPanel ])

    const NotificationToast = () => (
        <div className="fixed top-20 right-2 sm:right-5 z-50 space-y-2 max-w-sm w-full sm:w-auto px-2 sm:px-0">
            {notifications.map((notification, index) => (
                <div 
                    key={notification.id}
                    className={`p-3 sm:p-4 rounded-2xl shadow-2xl border-l-4 animate-slideInRight
                        ${notification.type === 'success' 
                            ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-emerald-500 text-emerald-100'
                            : notification.type === 'error'
                            ? 'bg-gradient-to-r from-rose-900/90 to-rose-800/90 border-rose-500 text-rose-100'
                            : 'bg-gradient-to-r from-blue-900/90 to-cyan-800/90 border-blue-500 text-blue-100'
                        } ${notification.urgent ? 'animate-pulse border-l-8 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : ''}`}
                    style={{
                        animationDelay: `${index * 100}ms`,
                        transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
                    }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`relative mt-1 ${
                                notification.type === 'success' ? 'text-emerald-400' :
                                notification.type === 'error' ? 'text-rose-400' :
                                'text-blue-400'
                            }`}>
                                <div className={`absolute inset-0 ${
                                    notification.type === 'success' ? 'bg-emerald-500/20' :
                                    notification.type === 'error' ? 'bg-rose-500/20' :
                                    'bg-blue-500/20'
                                } rounded-full animate-ping`}></div>
                                <i className={`relative z-10 text-sm sm:text-base ${
                                    notification.type === 'success' ? 'ri-checkbox-circle-fill' :
                                    notification.type === 'error' ? 'ri-error-warning-fill' :
                                    'ri-information-fill'
                                }`}></i>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-xs sm:text-sm">{notification.message}</p>
                                <p className="text-xs mt-1 opacity-75">
                                    {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-white/50 hover:text-white transition-colors ml-2 hover:scale-110"
                        >
                            <i className="ri-close-line text-sm sm:text-base"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )

    const renderActiveSection = () => {
        switch(activeSection) {
            case 'profile':
                return <CaptainDetails/>
            case 'history':
                return <RideHistory />
            case 'earnings':
                // console.log("active session is earing");
                return <Earnings stats={stats} />
            case 'support':
                return <Support />
            default:
                return <CaptainDetails/>
        }
    }

    return (
        <div className='h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 relative overflow-hidden'>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
                    33% { transform: translateY(-20px) translateX(10px) rotate(120deg); }
                    66% { transform: translateY(10px) translateX(-10px) rotate(240deg); }
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideInUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
                }
                
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                .animate-slideInUp {
                    animation: slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                .animate-glow {
                    animation: glow 2s infinite;
                }
                
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
                
                .floating-element {
                    animation: float 20s ease-in-out infinite;
                }
            `}</style>


            <NotificationToast />


            
            {/* Header */}
            <div className='fixed 
            
            top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'>
                <div className='p-4 sm:p-6 flex items-center justify-between'>
                    {/* Logo and Mobile Menu Button */}
                    <div className='flex items-center gap-3'>
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className='lg:hidden p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors'
                        >
                            <i className="ri-menu-line text-white text-xl"></i>
                        </button>
                        
                        <div className={`flex items-center gap-2 group/logo transition-all duration-1000 ${
                            mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
                        }`}>
                            <div className=''>
                                <p className='text-2xl font-semibold text-white  '>
                                    AutoTrack
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge with animation */}
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <div className={`transition-all duration-1000 delay-200 ${
                            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}>
                            <button 
                                onClick={() => setIsOnline(!isOnline)}
                                className={`group/status relative px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 ${
                                    isOnline 
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700' 
                                        : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:from-gray-800 hover:to-gray-900'
                                }`}
                            >
                                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
                                <span className='hidden sm:inline'>{isOnline ? 'Active • Accepting Rides' : 'Offline'}</span>
                                <span className='sm:hidden'>{isOnline ? 'Active' : 'Offline'}</span>
                                {isOnline && (
                                    <i className="ri-arrow-right-line ml-1 group-hover/status:translate-x-1 transition-transform hidden sm:inline"></i>
                                )}
                            </button>
                        </div>

                        {/* Logout Button */}
                        <div className={`transition-all duration-1000 delay-300 ${
                            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}>
                            <Link 
                                to='/captain/logout' 
                                className='group/logout relative h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 flex items-center justify-center rounded-xl transition-all duration-300 shadow-2xl hover:shadow-rose-500/50 text-white hover:scale-110 active:scale-95'
                            >
                                <i className="text-lg ri-logout-box-r-line group-hover/logout:rotate-180 transition-transform duration-500"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="
                    // lg:hidden fixed inset-0 z-40 bg-black/50
                    // h-screen 
                
                    "
                    // onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Layout */}
            <div className='flex flex-col lg:flex-row h-full pt-16 sm:pt-20'>
                {/* Map Section */}
                <div className={`w-full lg:w-2/3 h-[100vh] sm:h-[100vh] lg:h-[calc(100vh-5rem)] relative overflow-hidden transition-all duration-1000 delay-500 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}>
                    {captainLocation ? (
                        <div className='relative h-full group/map'>
                            {/* {pulseAnimation && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 animate-pulse z-10"></div>
                            )}
                             */}
                            <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 opacity-10'></div>
                            <Suspense fallback={<div className="h-full flex items-center justify-center text-white">Loading map...</div>}>
                                <LiveTracking captainLocation={captainLocation} />
                            </Suspense>
                            
                            

                            {pulseAnimation && (
                                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20'>
                                    <div className='relative w-12 h-12 sm:w-20 sm:h-20'>
                                        <div className='absolute inset-0 border-2 sm:border-4 border-blue-400 rounded-full animate-ping'></div>
                                        <div className='absolute inset-2 sm:inset-4 border-2 sm:border-4 border-cyan-400 rounded-full animate-ping' style={{animationDelay: '0.2s'}}></div>
                                        <div className='absolute inset-4 sm:inset-8 border-2 sm:border-4 border-blue-400 rounded-full animate-ping' style={{animationDelay: '0.4s'}}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='w-full h-full bg-gradient-to-br from-blue-900 via-black to-cyan-900 flex items-center justify-center'>
                            <div className='text-center'>
                                <div className='relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping opacity-20'></div>
                                    <div className='absolute inset-2 sm:inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50'>
                                        <i className="ri-map-pin-line text-xl sm:text-3xl text-white animate-bounce"></i>
                                    </div>
                                </div>
                                <p className='text-white/80 font-semibold text-lg sm:text-xl mb-1 sm:mb-2'>Getting Your Location</p>
                                <p className='text-blue-400/60 text-xs sm:text-sm animate-pulse'>Securing GPS signal...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Section */}
                <div className={`w-full lg:w-1/3 h-[70vh] sm:h-[70vh] lg:h-[calc(100vh-5rem)] bg-gradient-to-t from-gray-900/90 via-gray-900/80 to-black/90 backdrop-blur-xl border-t lg:border-l border-white/10 shadow-2xl overflow-auto transition-all duration-1000 delay-700 fixed lg:static bottom-0 left-0 z-40 lg:z-auto transform ${
                    isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
                } ${
                    mounted ? 'opacity-1' : 'opacity-0'
                }`}>
                    {/* Close button for mobile */}
                    

                    {/* Navigation Tabs */}
                    <div className="border-b border-white/10 ">
                    <div
                    className=''
                    >
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden top-4 right-4 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors z-50"
                            // className=""
                        >
                            <i className="ri-close-line text-white text-xl"></i>
                        </button>

                    </div>
                        <div className="flex p-2">
                            {[
                                { id: 'profile', icon: 'ri-user-line', label: 'Profile' },
                                { id: 'history', icon: 'ri-history-line', label: 'History' },
                                { id: 'earnings', icon: 'ri-money-dollar-circle-line', label: 'Earnings' },
                                { id: 'support', icon: 'ri-customer-service-line', label: 'Support' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`group/tab flex-1 flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                                        activeSection === tab.id 
                                            ? 'bg-gradient-to-b from-blue-500/20 to-blue-600/10 text-blue-400' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <i className={`${tab.icon} text-base sm:text-lg mb-1 group-hover/tab:scale-110 transition-transform`}></i>
                                    <span className="text-xs font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="p-3 sm:p-4 h-[calc(100%-4rem)] overflow-auto">
                        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                            {renderActiveSection()}
                        </Suspense>

                        
                    </div>
                </div>
            </div>

            {/* Ride Popup */}
            <div 
                ref={ridePopupPanelRef} 
                className='
                text-white
                fixed w-full z-60 bottom-0 bg-gradient-to-t from-gray-900 via-black to-gray-900 rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/10'
                style={{ opacity: 0 }}
            >
                <div className='p-4 sm:p-6 pt-6 sm:pt-8'>
                    {/* Drag Handle */}
                    <div className='flex justify-center mb-4'>
                        <div className='w-12 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full'></div>
                    </div>
                    <Suspense fallback={<div className="text-white text-center">Loading ride details...</div>}>
                        <RidePopUp
                            ride={ride}
                            setRidePopupPanel={setRidePopupPanel}
                            setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                            confirmRide={confirmRide}
                        />
                    </Suspense>
                </div>
            </div>

            {/* Confirm Ride Popup */}
            <div 
                ref={confirmRidePopupPanelRef} 
                className='
                text-white
                fixed w-full h-screen z-60 bottom-0 bg-gradient-to-t from-gray-900 via-black to-gray-900 rounded-t-3xl shadow-2xl overflow-auto border-t border-white/10'
                style={{ opacity: 0 }}
            >
                <div className='p-4 sm:p-6 pt-6 sm:pt-8'>
                    {/* Drag Handle */}
                    <div className='flex justify-center mb-4'>
                        <div className='w-12 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full'></div>
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