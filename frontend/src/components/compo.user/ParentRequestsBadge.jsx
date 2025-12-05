import React from 'react';

const ParentRequestsBadge = ({ parentRequests, setShowParentRequests }) => {
    if (parentRequests.length === 0) return null;

    return (
        <div 
            className='fixed top-4 sm:top-6 right-3 sm:right-5 z-30 group cursor-pointer animate-bounce'
            onClick={() => setShowParentRequests(true)}
        >
            <div className='relative'>
                {/* Notification Pulse */}
                <div className='absolute -inset-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-20 animate-ping transition-opacity'></div>
                
                {/* Badge */}
                <div className='relative bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-110'>
                    <span className='text-sm sm:text-base font-bold'>{parentRequests.length}</span>
                    
                    {/* New Request Indicator */}
                    {parentRequests.some(req => !req.seen) && (
                        <div className='absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse border border-white'></div>
                    )}
                </div>
                
                {/* Tooltip */}
                <div className='absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
                    <div className='bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg'>
                        {parentRequests.length} new request{parentRequests.length > 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentRequestsBadge;