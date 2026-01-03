import React from "react";
import { Suspense } from "react";
import LiveTrackingStatic from "../riding/LiveTrackingStatic.jsx";
import LiveTracking from "../riding/LiveTracking.jsx";

const StaticMapBg=({})=>{
    return (
        <div className='fixed top-0 left-0 w-full h-2/3 z-0'>
                        <Suspense fallback={
                            <div className='h-full bg-gradient-to-br from-blue-900 via-black to-cyan-900 flex items-center justify-center'>
                                <div className='text-center'>
                                    <div className='relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4'>
                                        <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping opacity-20'></div>
                                        <div className='absolute inset-2 sm:inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50'>
                                            <i className="ri-navigation-line text-xl sm:text-3xl text-white animate-spin"></i>
                                        </div>
                                    </div>
                                    <p className='text-white/80 font-semibold text-lg mb-2'>Loading Map</p>
                                    <p className='text-blue-400/60 text-sm animate-pulse'>Initializing navigation...</p>
                                </div>
                            </div>
                        }>
                            <LiveTrackingStatic/>
                            {/* <LiveTracking/> */}
                        </Suspense>
                    </div>
    )
}
export default StaticMapBg;