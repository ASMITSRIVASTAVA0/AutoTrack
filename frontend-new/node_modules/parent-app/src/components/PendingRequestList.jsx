import React from 'react';

const PendingRequestsList = ({ 
  pendingRequests, 
  cancelRequest, 
  loadParentData 
}) => {
  if (pendingRequests.length === 0) return null;

  return (
    <div className='relative group animate-slideInUp' style={{ animationDelay: '400ms' }}>
      <div className='absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
      <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
        <div className="flex justify-between items-center mb-4">
          <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
            <div className='relative w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse'>
              <i className="ri-time-line text-white"></i>
            </div>
            Pending Requests ({pendingRequests.length})
          </h2>
          <button
            onClick={loadParentData}
            className="text-sm text-white/60 hover:text-white flex items-center gap-1 hover:scale-105 transition-all"
            title="Refresh pending requests"
          >
            <i className="ri-refresh-line"></i>
            Refresh
          </button>
        </div>
        <div className='space-y-3'>
          {pendingRequests.map(request => (
            <div key={request._id} className="group/item relative p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-semibold text-white">{request.userName}</p>
                  <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                    <i className="ri-time-line text-amber-400"></i>
                    Requested: {new Date(request.requestedAt).toLocaleDateString()} at {new Date(request.requestedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelRequest(request._id)}
                    className="relative px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg hover:from-rose-700 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-rose-500/25 hover:scale-105 active:scale-95"
                  >
                    <i className="ri-close-line"></i>
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingRequestsList;