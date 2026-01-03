import React from 'react';

const RideHistoryModal = ({ 
  showRideHistory, 
  setShowRideHistory, 
  selectedChild, 
  rideHistory 
}) => {
  if (!showRideHistory) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl transform animate-scaleIn">
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">
              Ride History for <span className="text-pink-300">{selectedChild?.fullname?.firstname}</span>
            </h3>
            <button
              onClick={() => setShowRideHistory(false)}
              className="text-white/60 hover:text-white transition-colors hover:scale-110"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {rideHistory.length === 0 ? (
            <div className="p-8 text-center">
              <i className="ri-history-line text-5xl text-white/20 mb-4"></i>
              <p className="text-white/50">No ride history available</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {rideHistory.map((ride, index) => (
                <div key={ride._id} className="p-6 hover:bg-white/5 transition-all duration-300 group" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white group-hover:text-pink-300 transition-colors">
                        {ride.pickup?.address} → {ride.destination?.address}
                      </p>
                      <div className="flex gap-4 mt-2 flex-wrap">
                        <span className="text-sm text-white/60">
                          {new Date(ride.createdAt).toLocaleDateString()} at {new Date(ride.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-sm font-semibold text-emerald-400">₹{ride.fare}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ride.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      {ride.captain && (
                        <p className="text-sm text-white/60 mt-2">
                          Captain: {ride.captain.fullname?.firstname} {ride.captain.fullname?.lastname}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideHistoryModal;