import React from 'react';

const NotificationToast = ({ notifications, removeNotification }) => {
    return (
        <div className="fixed top-4 sm:top-6 right-2 sm:right-4 z-50 space-y-2 max-w-xs sm:max-w-sm">
            {notifications.map(notification => (
                <div 
                    key={notification.id}
                    className={`p-3 sm:p-4 rounded-xl shadow-lg border-l-4 transform transition-all duration-300 animate-slideInRight ${
                        notification.type === 'success' 
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : notification.type === 'error'
                            ? 'bg-red-50 border-red-500 text-red-700'
                            : 'bg-blue-50 border-blue-500 text-blue-700'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <i className={`mt-1 ${
                                notification.type === 'success' ? 'ri-checkbox-circle-fill text-green-500' :
                                notification.type === 'error' ? 'ri-error-warning-fill text-red-500' :
                                'ri-information-fill text-blue-500'
                            }`}></i>
                            <div>
                                <p className="font-medium text-xs sm:text-sm">{notification.message}</p>
                                <p className="text-xs mt-1 opacity-75">
                                    {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-500 hover:text-gray-700 ml-2"
                        >
                            <i className="ri-close-line text-sm sm:text-base"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;