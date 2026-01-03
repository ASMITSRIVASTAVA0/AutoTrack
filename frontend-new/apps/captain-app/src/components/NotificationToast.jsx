import React from "react";

const NotificationToast = ({
    notifications,
    mousePosition,
    removeNotification
}) => {
    return(
        <div className="fixed top-20 right-2 sm:right-5 z-50 space-y-2 max-w-sm w-full sm:w-auto px-2 sm:px-0">
            {notifications.map((notification, index) => (
                <div 
                    key={notification.id}
                    className={`p-3 sm:p-4 rounded-2xl shadow-2xl border-l-4 animate-slideInRight
                        ${notification.type === 'success' 
                            ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-emerald-500 text-emerald-100'
                            : notification.type === 'error'
                            ? 'bg-gradient-to-r from-rose-900/90 to-rose-800/90 border-rose-500 text-rose-100'
                            : 'bg-gradient-to-r from-blue-900/90 to-cyan-800/90 border-blue-500 text-blue-100'
                        } ${notification.urgent ? 'animate-pulse border-l-8 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : ''}`}
                    style={{
                        animationDelay: `${index * 100}ms`,
                        transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
                    }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`relative mt-1 ${
                                notification.type === 'success' ? 'text-emerald-400' :
                                notification.type === 'error' ? 'text-rose-400' :
                                'text-blue-400'
                            }`}>
                                <div className={`absolute inset-0 ${
                                    notification.type === 'success' ? 'bg-emerald-500/20' :
                                    notification.type === 'error' ? 'bg-rose-500/20' :
                                    'bg-blue-500/20'
                                } rounded-full animate-ping`}></div>
                                <i className={`relative z-10 text-sm sm:text-base ${
                                    notification.type === 'success' ? 'ri-checkbox-circle-fill' :
                                    notification.type === 'error' ? 'ri-error-warning-fill' :
                                    'ri-information-fill'
                                }`}></i>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-xs sm:text-sm">{notification.message}</p>
                                <p className="text-xs mt-1 opacity-75">
                                    {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-white/50 hover:text-white transition-colors ml-2 hover:scale-110"
                        >
                            <i className="ri-close-line text-sm sm:text-base"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
};

export default NotificationToast;