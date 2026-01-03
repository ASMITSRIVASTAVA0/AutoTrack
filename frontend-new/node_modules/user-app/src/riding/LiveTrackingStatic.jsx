import React from 'react'

const LiveTrackingStatic = ({ captainLocation }) => {
    return (
        <div className="relative h-full w-full">
            {/* Placeholder for actual map integration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px),
                                     linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}></div>
                
                {/* Animated route line */}
                <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4">
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-500/50 rounded-3xl"></div>
                    <div className="absolute inset-0 border-2 border-solid border-cyan-400 rounded-3xl animate-pulse"></div>
                </div>
                
                {/* Location markers */}
                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-md animate-ping"></div>
                        <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                            <i className="ri-map-pin-line text-white"></i>
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md animate-ping" style={{animationDelay: '0.5s'}}></div>
                        <div className="relative w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl">
                            <i className="ri-flag-line text-white"></i>
                        </div>
                    </div>
                </div>
                
                {/* Moving vehicle */}
                <div className="absolute top-1/2 left-1/3 animate-bounce">
                    <div className="relative">
                        <div className="absolute -top-4 -left-4 right-4 bottom-4 bg-cyan-500/20 rounded-full blur-md animate-ping"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-2xl rotate-45">
                            <i className="ri-car-line text-white -rotate-45 text-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Grid labels */}
            <div className="absolute top-4 left-4 text-white/50 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>Destination</span>
                </div>
            </div>
        </div>
    )
}

export default LiveTrackingStatic