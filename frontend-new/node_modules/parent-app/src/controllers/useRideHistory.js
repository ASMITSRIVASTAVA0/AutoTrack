import { useState } from 'react';
import axios from 'axios';

const useRideHistory = (addNotification) => {
  const [rideHistory, setRideHistory] = useState([]);
  const [showRideHistory, setShowRideHistory] = useState(false);

  const loadRideHistory = async (childId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/parents/child-rides/${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      setRideHistory(response.data.rides || []);
    } catch (error) {
      console.error('Error loading ride history:', error);
      addNotification('Error loading ride history', 'error');
    }
  };

  return {
    rideHistory,
    setRideHistory,
    showRideHistory,
    setShowRideHistory,
    loadRideHistory
  };
};

export default useRideHistory;