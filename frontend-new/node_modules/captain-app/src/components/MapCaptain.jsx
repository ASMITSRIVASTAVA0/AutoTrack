import {Suspense} from "react";
import LiveTracking from "../../pages.riding/LiveTracking";
import React from "react";
const MapCaptain=({
    mounted,
    captainLocation,
    pulseAnimation,

})=>{
    return (
        <div className={`w-full lg:w-2/3 h-[100vh] sm:h-[100vh] lg:h-[calc(100vh-5rem)] relative overflow-hidden transition-all duration-1000 delay-500 ${
                            mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                        }`}>
                            {/* {captainLocation ? (
                                <div className='relative h-full group/map'>
                                    
                                    <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 opacity-10'></div>
                                    <Suspense fallback={<div className="h-full flex items-center justify-center text-white">Loading map...</div>}>
                                        {/* <LiveTracking captainLocation={captainLocation} /> *
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
                            )} */}
                        </div>
    )
}

export default MapCaptain;