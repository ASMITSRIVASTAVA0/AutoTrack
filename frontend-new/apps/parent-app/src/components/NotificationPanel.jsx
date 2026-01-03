import React from 'react';

const NotificationsPanel = ({ notifications, clearNotifications, markNotificationAsRead, removeNotification }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="relative group animate-slideInUp mb-6" style={{ animationDelay: '200ms' }}>
      <div className='absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
      <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className='relative w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg'>
              <i className="ri-notification-line text-white"></i>
            </div>
            Notifications ({notifications.length})
          </h3>
          <button
            onClick={clearNotifications}
            className="text-white/50 hover:text-white text-sm font-semibold flex items-center gap-1 hover:scale-105 transition-all"
          >
            <i className="ri-close-line"></i>
            Clear All
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
          {notifications.slice(0, 3).map(notification => (
            <div key={notification.id} className={`text-sm p-3 rounded-lg border-l-4 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-100' 
                : notification.type === 'error'
                ? 'bg-rose-500/10 border-rose-500 text-rose-100'
                : 'bg-blue-500/10 border-blue-500 text-blue-100'
            }`}>
              <div className="flex items-start gap-2">
                <i className={`mt-0.5 ${
                  notification.type === 'success' ? 'ri-checkbox-circle-fill text-emerald-400' :
                  notification.type === 'error' ? 'ri-error-warning-fill text-rose-400' :
                  'ri-information-fill text-blue-400'
                }`}></i>
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;