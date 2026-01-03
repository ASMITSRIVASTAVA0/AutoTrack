import { useState, useRef } from 'react';
import axios from 'axios';

const useParentData = (addNotification) => {
  const [children, setChildren] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isLoadingData = useRef(false);

  const loadParentData = async () => {
    if (isLoadingData.current) return;
    
    try {
      isLoadingData.current = true;
      setIsLoading(true);
      setIsRefreshing(true);
      
      const token = localStorage.getItem('tokenParent');
      
      // Get parent profile
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/parents/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      const parentData = response.data.parent;
      if (parentData && parentData.children) {
        setChildren(parentData.children || []);
      } else {
        setChildren([]);
      }
      
      // Load pending requests
      const requestsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/parents/pending-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      if (requestsResponse.data && requestsResponse.data.requests) {
        setPendingRequests(requestsResponse.data.requests || []);
      } else {
        setPendingRequests([]);
      }
      
    } catch (error) {
      console.error('Error loading parent data:', error);
      addNotification(
        'Error loading parent data: ' + (error.response?.data?.message || error.message),
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isLoadingData.current = false;
    }
  };

  return {
    children,
    setChildren,
    pendingRequests,
    setPendingRequests,
    isLoading,
    isRefreshing,
    loadParentData
  };
};

export default useParentData;