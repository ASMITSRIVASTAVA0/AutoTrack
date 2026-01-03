import React from 'react';

const ActiveRideDetails = ({ 
  currentRide, 
  captainLocation, 
  sendMessageToChild 
}) => {
  if (!currentRide) return (
    <div className="mb-6 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10">
        <p className="text-white/60 flex items-center gap-2">
          <i className="ri-information-line text-cyan-400"></i>
          No active ride - {selectedChild.fullname?.firstname} is not currently on a trip
        </p>
    </div>
  );

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-white text-lg flex items-center gap-2">
          <i className="ri-roadster-fill text-cyan-400 animate-pulse"></i>
          Active Ride Details
        </h3>
        <button
          onClick={sendMessageToChild}
          className="relative px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-sm flex items-center gap-1 hover:scale-105"
        >
          <i className="ri-message-2-line"></i>
          Message Child
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Status:</span>
          <span className="font-medium capitalize text-cyan-400">{currentRide.status}</span>
        </div>
        {currentRide.captain && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">Captain:</span>
            <span className="font-medium text-white">
              {currentRide.captain.name} 
            </span>
          </div>
        )}
        {currentRide.pickup && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">From:</span>
            <span className="font-medium text-white/90 text-right">{currentRide.pickup.address} coords: {currentRide.pickup.location.coordinates[1]} {currentRide.pickup.location.coordinates[0]}</span>
          </div>
        )}
        {currentRide.destination && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">To:</span>
            <span className="font-medium text-white/90 text-right">{currentRide.destination.address} coords: {currentRide.destination.location.coordinates[1]} {currentRide.destination.location.coordinates[0]}</span>
          </div>
        )}
        {currentRide.fare && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">Fare:</span>
            <span className="font-medium text-emerald-400">₹{currentRide.fare}</span>
          </div>
        )}
        {captainLocation && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">Captain Location:</span>
            <span className="font-medium text-emerald-400">{captainLocation.coordinates[1]}, {captainLocation.coordinates[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveRideDetails;