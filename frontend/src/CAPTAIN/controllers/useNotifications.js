import { useState } from 'react';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', urgent = false) => {
    const id = Date.now();
    const notification = { 
      id, 
      message, 
      type, 
      timestamp: new Date(),
      urgent,
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    if (!urgent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, 5000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
};

export default useNotifications;