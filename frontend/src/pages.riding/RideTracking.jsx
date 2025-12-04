import React, { useState, useEffect } from 'react'

const RideTracking = () => {
    const [time, setTime] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="absolute top-20 sm:top-24 left-4 sm:left-6 z-30">
            <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-slideInRight">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                                <i className="ri-time-line text-white text-lg"></i>
                            </div>
                            <p className="text-xs text-gray-400">Time</p>
                            <p className="text-lg font-bold text-white">{formatTime(time)}</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                                <i className="ri-roadster-line text-white text-lg"></i>
                            </div>
                            <p className="text-xs text-gray-400">ETA</p>
                            <p className="text-lg font-bold text-white">8 min</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                                <i className="ri-speed-line text-white text-lg"></i>
                            </div>
                            <p className="text-xs text-gray-400">Speed</p>
                            <p className="text-lg font-bold text-white">45 km/h</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Pickup</span>
                            <span>45%</span>
                            <span>Destination</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-full animate-pulse"
                                style={{ width: '45%' }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RideTracking