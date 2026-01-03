import React from "react";

const NotificationToast = ({
    notifications,
    markNotificationAsRead,
    removeNotification,
    mousePosition
}) => {

    return (
        <div className="fixed top-20 right-5 z-50 space-y-2 max-w-sm">
            {notifications.map((notification, index) => (
                <div 
                key={notification.id}
                className={`p-4 rounded-2xl shadow-2xl border-l-4 animate-slideInRight
                    ${notification.type === 'success' 
                    ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-emerald-500 text-emerald-100'
                    : notification.type === 'error'
                    ? 'bg-gradient-to-r from-rose-900/90 to-rose-800/90 border-rose-500 text-rose-100'
                    : notification.type === 'warning'
                    ? 'bg-gradient-to-r from-amber-900/90 to-amber-800/90 border-amber-500 text-amber-100'
                    : 'bg-gradient-to-r from-pink-900/90 to-purple-800/90 border-pink-500 text-pink-100'
                    } ${notification.urgent ? 'animate-pulse border-l-8 shadow-[0_0_30px_rgba(255,0,100,0.5)]' : ''}`}
                style={{
                    animationDelay: `${index * 100}ms`,
                    transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
                }}
                onClick={() => markNotificationAsRead(notification.id)}
                >
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                    <div className={`relative mt-1 ${
                        notification.type === 'success' ? 'text-emerald-400' :
                        notification.type === 'error' ? 'text-rose-400' :
                        notification.type === 'warning' ? 'text-amber-400' :
                        'text-pink-400'
                    }`}>
                        <div className={`absolute inset-0 ${
                        notification.type === 'success' ? 'bg-emerald-500/20' :
                        notification.type === 'error' ? 'bg-rose-500/20' :
                        notification.type === 'warning' ? 'bg-amber-500/20' :
                        'bg-pink-500/20'
                        } rounded-full animate-ping`}></div>
                        <i className={`relative z-10 ${
                        notification.type === 'success' ? 'ri-checkbox-circle-fill' :
                        notification.type === 'error' ? 'ri-error-warning-fill' :
                        notification.type === 'warning' ? 'ri-alert-fill' :
                        'ri-information-fill'
                        }`}></i>
                    </div>
                    <div>
                        <p className="font-medium text-sm">{notification.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                    </div>
                    <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                    }}
                    className="text-white/50 hover:text-white transition-colors ml-2 hover:scale-110 transition-transform"
                    >
                    <i className="ri-close-line"></i>
                    </button>
                </div>
                {!notification.read && (
                    <div className="w-2 h-2 bg-pink-400 rounded-full absolute top-2 right-2 animate-pulse"></div>
                )}
                </div>
            ))}
        </div>
    )
};

export default NotificationToast;