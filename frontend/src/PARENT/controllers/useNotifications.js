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
    
    if (urgent) {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    if (!urgent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, 8000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearNotifications
  };
};

export default useNotifications;