import React from "react";
import {Link} from "react-router-dom";

const Header=({
    setIsSidebarOpen,
    isSidebarOpen,
    mounted,
    isOnline,
    setIsOnline
})=>{
    return (
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
                                to='/captains/logout' 
                                className='group/logout relative h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 flex items-center justify-center rounded-xl transition-all duration-300 shadow-2xl hover:shadow-rose-500/50 text-white hover:scale-110 active:scale-95'
                            >
                                <i className="text-lg ri-logout-box-r-line group-hover/logout:rotate-180 transition-transform duration-500"></i>
                            </Link>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Header;