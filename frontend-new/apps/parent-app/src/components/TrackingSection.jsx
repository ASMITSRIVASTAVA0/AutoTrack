import React from 'react';
import ActiveRideDetails from './ActiveRideDetails';
import {TrackingMap} from './TrackingMap';

const TrackingSection = ({ 
  selectedChild, 
  currentRide, 
  captainLocation, 
  mapCenter, 
  getRoutePolyline, 
  mapRef,
  pulseAnimation,
  sendMessageToChild 
}) => {
  if (!selectedChild) {
    return (
      <div className='relative group animate-slideInUp' style={{ animationDelay: '600ms' }}>
                  <div className='absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
                  <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center'>
                    <i className="ri-map-pin-line text-5xl text-white/20 mb-4"></i>
                    <h3 className="text-lg font-semibold text-white/70 mb-2">No Child Selected</h3>
                    <p className="text-white/50">Select a child from the list to start tracking</p>
                  </div>
                </div>
    )
  }

  return (
    <div className='space-y-6'>
            {/* Map for Tracking - Animated */}
            {selectedChild ? 
              (
                <div className='relative group animate-slideInUp' style={{ animationDelay: '600ms' }}>
                  <div className='absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
                  <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                    <h2 className='text-xl font-semibold mb-4 text-white flex items-center gap-2'>
                      <div className='relative w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg animate-wave'>
                        <i className="ri-map-pin-line text-white"></i>
                      </div>
                      Tracking: <span className='text-pink-300'>{selectedChild.fullname?.firstname}</span>
                    </h2>
                    

                    {/* RIDE INFO=============================================== */}
                    <ActiveRideDetails
                      currentRide={currentRide}
                      captainLocation={captainLocation}
                      selectedChild={selectedChild}
                      sendMessageToChild={sendMessageToChild}
                    />

                    {/* MAP SHOWING CAPTAIN============================================= */}
                    <div className="h-96 rounded-xl overflow-hidden border border-white/20 shadow-2xl relative group/map">
                      {/* Pulsing effect for map */}
                      {pulseAnimation && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-pulse z-10"></div>
                      )}

                      {/* CAPTAIN LOCATION, PICKUP POINT,DEST POINT SHOW IN MAP */}
                      
                      <TrackingMap
                        mapCenter={mapCenter}
                        captainLocation={captainLocation}
                        currentRide={currentRide}
                        getRoutePolyline={getRoutePolyline}
                        mapRef={mapRef}
                        pulseAnimation={pulseAnimation}
                      />


                    </div>
                  </div>
                </div>
              ) 
                : 
              (
                <div className='relative group animate-slideInUp' style={{ animationDelay: '600ms' }}>
                  <div className='absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
                  <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center'>
                    <i className="ri-map-pin-line text-5xl text-white/20 mb-4"></i>
                    <h3 className="text-lg font-semibold text-white/70 mb-2">No Child Selected</h3>
                    <p className="text-white/50">Select a child from the list to start tracking</p>
                  </div>
                </div>
              )
            }

            
          </div>
  );
};

export default TrackingSection;