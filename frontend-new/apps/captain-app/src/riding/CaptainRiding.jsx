// import React, { useRef, useState } from 'react'
// import { Link, useLocation } from 'react-router-dom'
// import FinishRide from '../pages.riding/FinishRide'
// import { useGSAP } from '@gsap/react'
// import gsap from 'gsap'
// import LiveTracking from '../components/LiveTracking'

// const CaptainRiding = () => {

//     const [ finishRidePanel, setFinishRidePanel ] = useState(false)
//     const finishRidePanelRef = useRef(null)
//     const location = useLocation()
//     const rideData = location.state?.ride


//     useGSAP(function () {
//         if (finishRidePanel) {
//             gsap.to(finishRidePanelRef.current, {
//                 transform: 'translateY(0)'
//             })
//         } else {
//             gsap.to(finishRidePanelRef.current, {
//                 transform: 'translateY(100%)'
//             })
//         }
//     }, [ finishRidePanel ])


//     return (
//         <div className='h-screen relative flex flex-col justify-end'>

//             <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
//                 <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
//                 <Link 
//                 to='/captains/home' 
//                 className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
//                     <i className="text-lg font-medium ri-logout-box-r-line"></i>
//                 </Link>
//             </div>

//             <div 
//             className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10'
//             onClick={() => {
//                 setFinishRidePanel(true)
//             }}
//             >
//                 <h5 
//                 className='p-1 text-center w-[90%] absolute top-0' 
//                 onClick={() => {

//                 }}>
//                     <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
//                 </h5>
//                 <h4 
//                 className='text-xl font-semibold'>
//                     {'4 KM away'}
//                 </h4>
//                 <button 
//                 className=' bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>
//                     Complete Ride
//                 </button>
//             </div>
//             <div 
//             ref={finishRidePanelRef} 
//             className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
//                 <FinishRide
//                     ride={rideData}
//                     setFinishRidePanel={setFinishRidePanel} 
//                 />

//             </div>

//             <div className='h-screen fixed w-screen top-0 z-[-1]'>
//                 <LiveTracking />
//             </div>

//         </div>
//     )
// }

// export default CaptainRiding

import React, { useRef, useState, useEffect, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

// Lazy load components
const FinishRide = lazy(() => import('./FinishRide'))
const LiveTracking = lazy(() => import('./LiveTracking'))

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [distance, setDistance] = useState('4 KM away')
    const [timeElapsed, setTimeElapsed] = useState(0)
    
    const finishRidePanelRef = useRef(null)
    const location = useLocation()
    const rideData = location.state?.ride

    // Initialize mounted state
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100)
        
        // Simulate distance updates
        const distanceInterval = setInterval(() => {
            const distances = ['4 KM away', '3.5 KM away', '3 KM away', '2.5 KM away', '2 KM away', '1.5 KM away', '1 KM away', '500 M away', 'Arriving']
            setDistance(prev => {
                const index = distances.indexOf(prev)
                return index < distances.length - 1 ? distances[index + 1] : prev
            })
        }, 60000) // Update every minute
        
        // Timer for ride duration
        const timerInterval = setInterval(() => {
            setTimeElapsed(prev => prev + 1)
        }, 1000)
        
        return () => {
            clearTimeout(timer)
            clearInterval(distanceInterval)
            clearInterval(timerInterval)
        }
    }, [])

    useGSAP(function () {
        if (finishRidePanel) {
            gsap.fromTo(finishRidePanelRef.current, 
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            )
        } else {
            gsap.to(finishRidePanelRef.current, {
                y: "100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            })
        }
    }, [finishRidePanel])

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className='h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 relative overflow-hidden'>
            {/* Custom Animations */}
            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideInUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-10px) translateX(5px); }
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                .animate-slideInUp {
                    animation: slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                .animate-pulseGlow {
                    animation: pulseGlow 2s infinite;
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>

            {/* Header */}
            <div className={`fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-1000 ${
                mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
            }`}>
                <div className='p-4 sm:p-6 flex items-center justify-between'>
                    {/* Logo */}
                    <div className='flex items-center gap-3 group/logo'>
                        <div className='relative w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover/logo:shadow-blue-500/50 transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-12'>
                            <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur opacity-50 group-hover/logo:opacity-100 transition-opacity duration-500'></div>
                            <img className='w-5 sm:w-8 relative z-10 filter brightness-0 invert' src="/autotracklogo.png" alt="AutoTrack" />
                        </div>
                        <div className='hidden sm:block'>
                            <p className='text-xs text-white/60 group-hover/logo:text-white/80 transition-colors'>AutoTrack</p>
                            <p className='text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer'>
                                Active Ride
                            </p>
                        </div>
                    </div>

                    {/* Ride Info */}
                    <div className='flex items-center gap-3 sm:gap-4'>
                        {/* Ride Timer */}
                        <div className='bg-gradient-to-r from-blue-900/50 to-cyan-900/30 backdrop-blur-sm border border-blue-500/30 px-3 sm:px-4 py-2 rounded-full'>
                            <div className='flex items-center gap-2'>
                                <i className="ri-time-line text-blue-400"></i>
                                <span className='text-xs sm:text-sm font-medium text-white'>{formatTime(timeElapsed)}</span>
                            </div>
                        </div>

                        {/* Back Button */}
                        <a 
                            href='/captains/home' 
                            className='group/back relative h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 flex items-center justify-center rounded-xl transition-all duration-300 shadow-2xl hover:shadow-gray-500/50 text-white hover:scale-110 active:scale-95'
                        >
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/back:translate-x-full transition-transform duration-1000'></div>
                            <i className="ri-arrow-left-line text-lg group-hover/back:-translate-x-1 transition-transform"></i>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='h-full pt-16 sm:pt-20'>
                {/* Map Section */}
                <div className={`h-full relative overflow-hidden transition-all duration-1000 delay-300 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                    <Suspense fallback={
                        <div className='h-full bg-gradient-to-br from-blue-900 via-black to-cyan-900 flex items-center justify-center'>
                            <div className='text-center'>
                                <div className='relative w-20 h-20 mx-auto mb-4'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping opacity-20'></div>
                                    <div className='absolute inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50'>
                                        <i className="ri-navigation-line text-2xl text-white animate-spin"></i>
                                    </div>
                                </div>
                                <p className='text-white/80 font-semibold text-lg mb-2'>Loading Navigation</p>
                                <p className='text-blue-400/60 text-sm animate-pulse'>Preparing route guidance...</p>
                            </div>
                        </div>
                    }>
                        <LiveTracking />
                    </Suspense>

                    {/* Live Tracking Indicator */}
                    <div className='absolute top-4 sm:top-6 right-4 sm:right-6 z-30'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur-xl animate-ping'></div>
                            <div className='relative bg-gradient-to-r from-red-600 to-red-700 backdrop-blur-sm text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-2 shadow-2xl z-20 border border-red-500/50 animate-pulseGlow'>
                                <span className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full animate-pulse'></span>
                                <span className='text-xs sm:text-sm font-semibold'>LIVE TRACKING</span>
                                <i className="ri-navigation-line animate-spin hidden sm:inline" style={{animationDuration: '3s'}}></i>
                            </div>
                        </div>
                    </div>

                    {/* Ride Stats Overlay */}
                    <div className='absolute top-4 sm:top-6 left-4 sm:left-6 z-30'>
                        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl animate-slideInRight">
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg mb-1 sm:mb-2">
                                            <i className="ri-route-line text-white text-sm sm:text-lg"></i>
                                        </div>
                                        <p className="text-xs text-gray-400">Distance</p>
                                        <p className="text-sm sm:text-lg font-bold text-white">{distance}</p>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg mb-1 sm:mb-2">
                                            <i className="ri-time-line text-white text-sm sm:text-lg"></i>
                                        </div>
                                        <p className="text-xs text-gray-400">ETA</p>
                                        <p className="text-sm sm:text-lg font-bold text-white">12 min</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="pt-2">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Started</span>
                                        <span>65%</span>
                                        <span>Destination</span>
                                    </div>
                                    <div className="w-full h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-full animate-pulse"
                                            style={{ width: '65%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar (Mobile) */}
            <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-gray-900 via-black to-gray-900 backdrop-blur-xl border-t border-white/10 shadow-2xl transition-all duration-1000 delay-500 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <div className='p-4'>
                    {/* Drag Handle */}
                    <div className='flex justify-center mb-3'>
                        <div className='w-12 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full'></div>
                    </div>
                    
                    <div className='flex items-center justify-between'>
                        <div className='text-left'>
                            <p className='text-xs text-gray-400'>Distance to destination</p>
                            <p className='text-xl font-bold text-white'>{distance}</p>
                        </div>
                        <button 
                            onClick={() => setFinishRidePanel(true)}
                            className='group/complete relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95'
                        >
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/complete:translate-x-full transition-transform duration-1000'></div>
                            <i className="ri-checkbox-circle-line group-hover/complete:scale-110 transition-transform"></i>
                            <span>Complete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Action Button */}
            <div className={`hidden lg:block fixed bottom-6 right-6 z-30 transition-all duration-1000 delay-500 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <button 
                    onClick={() => setFinishRidePanel(true)}
                    className='group/complete-desktop relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 animate-float'
                >
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/complete-desktop:translate-x-full transition-transform duration-1000'></div>
                    <i className="ri-checkbox-circle-line group-hover/complete-desktop:scale-110 transition-transform"></i>
                    Complete Ride
                </button>
            </div>

            {/* Finish Ride Panel */}
            <div 
                ref={finishRidePanelRef} 
                className='fixed w-full z-50 bottom-0 bg-gradient-to-t from-gray-900 via-black to-gray-900 rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/10'
                style={{ opacity: 0 }}
            >
                <div className='p-4 sm:p-6 pt-6 sm:pt-8 max-h-[80vh] overflow-auto'>
                    {/* Drag Handle */}
                    <div className='flex justify-center mb-4'>
                        <div className='w-12 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full'></div>
                    </div>
                    
                    <Suspense fallback={
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                            <p className="text-white mt-4">Loading ride details...</p>
                        </div>
                    }>
                        <FinishRide
                            ride={rideData}
                            setFinishRidePanel={setFinishRidePanel} 
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export default CaptainRiding