import React from 'react';

const ChildrenList = ({ 
  children, 
  selectedChild, 
  currentRide, 
  captainLocation, 
  trackChildCaptainLocation, 
  loadRideHistory, 
  setShowRideHistory, 
  removeChild 
}) => {
  return (
    <div className='relative group animate-slideInUp' style={{ animationDelay: '500ms' }}>
      <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
      <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
        <div className="flex justify-between items-center mb-4">
          <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
            <div className='relative w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg'>
              <i className="ri-user-line text-white"></i>
            </div>
            My Children ({children.length})
          </h2>
          {children.length > 0 && (
            <span className="text-sm text-white/60">
              {selectedChild ? `Tracking: ${selectedChild.fullname?.firstname}` : 'Select a child to track'}
            </span>
          )}
        </div>
        {children.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-user-search-line text-5xl text-white/20 mb-4"></i>
            <p className="text-white/50 text-lg font-medium">No children added yet</p>
            <p className="text-white/30 text-sm mt-1">Send requests to users to add them as your children</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child, index) => {
              return (
                <div
                  key={child._id}
                  className={`group/item relative p-4 rounded-xl border transition-all duration-500 hover:scale-[1.02] ${
                    selectedChild?._id === child._id 
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 shadow-2xl shadow-pink-500/20' 
                      : 'bg-gradient-to-r from-white/5 to-transparent border-white/10 hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/10'
                  }`}
                  style={{ animation: `slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`, animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
                    selectedChild?._id === child._id 
                      ? 'from-pink-500/30 to-purple-500/30' 
                      : 'from-pink-500/10 to-purple-500/10'
                  } opacity-0 group-hover/item:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-2xl transition-all duration-500 group-hover/item:scale-110 ${
                        selectedChild?._id === child._id 
                          ? 'bg-gradient-to-br from-pink-500 to-purple-500 animate-pulse' 
                          : 'bg-gradient-to-br from-gray-600 to-gray-700'
                      }`}>
                        {selectedChild?._id === child._id && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                        )}
                        {child.fullname?.firstname?.charAt(0)}{child.fullname?.lastname?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {child.fullname?.firstname} {child.fullname?.lastname}
                        </p>
                        <p className="text-sm text-white/60">{child.email}</p>
                        {selectedChild?._id === child._id && currentRide && (
                          <p className="text-sm text-cyan-400 font-semibold flex items-center gap-1 mt-1">
                            <i className="ri-roadster-line"></i>
                            Active Ride: <span className="capitalize">{currentRide.status}</span>
                            {captainLocation && (
                              <span className="flex items-center gap-1 ml-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live tracking active
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => trackChildCaptainLocation(child._id)}
                        className={`relative px-4 py-2 rounded-lg transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 ${
                          selectedChild?._id === child._id 
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-emerald-500/25' 
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/25'
                        }`}
                      >
                        <i className={`ri-map-pin-line ${selectedChild?._id === child._id ? 'animate-bounce' : ''}`}></i>
                        {selectedChild?._id === child._id ? 'Tracking' : 'Track'}
                      </button>

                      <button
                        onClick={() => {
                          loadRideHistory(child._id);
                          setShowRideHistory(true);
                        }}
                        className="relative px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                      >
                        <i className="ri-history-line"></i>
                        Ride History
                      </button>

                      <button
                        onClick={() => removeChild(child._id)}
                        className="relative px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg hover:from-rose-700 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                      >
                        <i className="ri-user-unfollow-line"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenList;