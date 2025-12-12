import React from 'react';

const ParentRequestsPanel = ({ 
    showParentRequests, 
    setShowParentRequests, 
    parentRequests, 
    isLoadingRequests, 
    acceptParentRequest, 
    rejectParentRequest 
}) => {
    if (!showParentRequests) return null;

    return (
        <div className='fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-2 sm:p-4'>
            <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl animate-slideInUp'>
                <div className='flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b border-gray-200'>
                    <div>
                        <h3 className='text-xl sm:text-2xl font-bold text-gray-900'>Parent Requests</h3>
                        <p className='text-xs sm:text-sm text-gray-600 mt-1'>
                            {parentRequests.length} pending request{parentRequests.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowParentRequests(false)}
                        className='text-gray-400 hover:text-gray-600 text-xl sm:text-2xl transition-colors'
                    >
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                
                {isLoadingRequests ? (
                    <div className='flex flex-col items-center justify-center py-8 sm:py-12'>
                        <div className='animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-4'></div>
                        <p className='text-gray-600 font-medium text-sm sm:text-base'>Loading requests...</p>
                    </div>
                ) : parentRequests.length === 0 ? (
                    <div className='text-center py-8 sm:py-12'>
                        <i className="ri-inbox-line text-4xl sm:text-5xl text-gray-300 mb-4"></i>
                        <p className='text-gray-500 text-base sm:text-lg font-medium'>No pending requests</p>
                        <p className='text-gray-400 text-xs sm:text-sm mt-1'>Parent requests will appear here</p>
                    </div>
                ) : (
                    <div className='space-y-3 sm:space-y-4'>
                        {parentRequests.map(request => (
                            <div 
                                key={request.parentId || request._id} 
                                className='border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 transition-all duration-300 shadow-sm hover:shadow-md'
                            >
                                <div className='flex justify-between items-start mb-3 sm:mb-4'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 sm:gap-3 mb-2'>
                                            <div className='w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg shadow-lg'>
                                                {request.parentName?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <p className='font-bold text-sm sm:text-lg text-gray-900'>{request.parentName}</p>
                                                <p className='text-xs text-gray-600 flex items-center gap-1 mt-1'>
                                                    <i className="ri-time-line"></i>
                                                    {new Date(request.requestedAt || request.timestamp).toLocaleDateString()} at {' '}
                                                    {new Date(request.requestedAt || request.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='text-xs text-gray-700 bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100'>
                                            <i className="ri-shield-check-line text-blue-500 mr-2"></i>
                                            Wants to track your rides for safety and receive ride notifications.
                                        </p>
                                    </div>
                                </div>
                                <div className='flex gap-2 sm:gap-3'>
                                    <button
                                        onClick={() => acceptParentRequest(request._id,request.parentId)}
                                        disabled={isLoadingRequests}
                                        className='flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {isLoadingRequests ? (
                                            <div className='animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white'></div>
                                        ) : (
                                            <>
                                                <i className="ri-check-line"></i>
                                                Accept
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => rejectParentRequest(request._id,request.parentId)}
                                        disabled={isLoadingRequests}
                                        className='flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <i className="ri-close-line"></i>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentRequestsPanel;