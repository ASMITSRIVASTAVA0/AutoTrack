import React from 'react'
import { Link } from 'react-router-dom'

const RideHeader = ({ distance, onCompleteClick }) => {
    return (
        <div className={`transition-all duration-1000`}>
            {/* Header */}
            <div className='fixed p-4 sm:p-6 top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl flex items-center justify-between'>
                <div className='flex items-center gap-3 group/logo'>
                    <div className='relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover/logo:shadow-blue-500/50 transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-12'>
                        <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur opacity-50 group-hover/logo:opacity-100 transition-opacity duration-500'></div>
                        <img className='w-5 sm:w-6 relative z-10 filter brightness-0 invert' src="/autotracklogo.png" alt="AutoTrack" />
                    </div>
                    <div className='hidden sm:block'>
                        <p className='text-xs text-white/60'>AutoTrack</p>
                        <p className='text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                            Active Ride
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-3 sm:gap-4'>
                    {/* Distance Indicator */}
                    <div className='bg-gradient-to-r from-blue-900/50 to-cyan-900/30 backdrop-blur-sm border border-blue-500/30 px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 animate-pulse'>
                        <div className='w-2 h-2 bg-blue-400 rounded-full animate-ping'></div>
                        <span className='text-xs sm:text-sm font-medium text-white'>{distance}</span>
                    </div>

                    {/* Complete Ride Button (Desktop) */}
                    <button 
                        onClick={onCompleteClick}
                        className='hidden sm:flex group/complete relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 items-center gap-2 shadow-2xl hover:scale-105 active:scale-95'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/complete:translate-x-full transition-transform duration-1000'></div>
                        <i className="ri-checkbox-circle-line group-hover/complete:scale-110 transition-transform"></i>
                        Complete Ride
                    </button>

                    {/* Logout Button */}
                    <Link 
                        to='/captain-home' 
                        className='group/logout relative h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 flex items-center justify-center rounded-xl transition-all duration-300 shadow-2xl hover:shadow-rose-500/50 text-white hover:scale-110 active:scale-95'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/logout:translate-x-full transition-transform duration-1000'></div>
                        <i className="text-lg ri-close-line group-hover/logout:rotate-90 transition-transform duration-500"></i>
                    </Link>
                </div>
            </div>

            {/* Mobile Bottom Action Bar */}
            <div className='lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-gray-900 via-black to-gray-900 backdrop-blur-xl border-t border-white/10 shadow-2xl p-4'>
                <div className='flex items-center justify-between'>
                    <div className='text-left'>
                        <p className='text-sm text-gray-400'>Distance to destination</p>
                        <p className='text-xl font-bold text-white'>{distance}</p>
                    </div>
                    <button 
                        onClick={onCompleteClick}
                        className='group/complete-mobile relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/complete-mobile:translate-x-full transition-transform duration-1000'></div>
                        <i className="ri-checkbox-circle-line"></i>
                        <span className='hidden xs:inline'>Complete</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RideHeader;