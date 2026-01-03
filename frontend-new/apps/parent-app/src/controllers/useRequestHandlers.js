import { useState } from 'react';
import axios from 'axios';

const useRequestHandlers = ({
  socket,
  parent,
  addNotification,
  loadParentData,
  setPendingRequests,
  setChildren,
  setSelectedChild,
  setCurrentRide,
  setCaptainLocation
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const sendChildRequest = async (e) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      addNotification('Please enter a valid email', 'error');
      return;
    }

    try {
      setIsSendingRequest(true);
      const token = localStorage.getItem('tokenParent');
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/parents/send-request`,
        { userEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const requestId = response.data.requestId;
      addNotification('Request sent successfully!', 'success');
      setUserEmail('');
      loadParentData();

      if (socket && parent) {
        socket.emit('parent-request-sent', {
          userEmail: userEmail,
          parentId: parent._id,
          requestId: requestId
        });
      }

    } catch (error) {
      console.error('Error sending child request:', error);
      const errorMessage = error.response?.data?.message || 'Error sending request. Please try again.';
      addNotification(errorMessage, 'error');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      const request = pendingRequests.find(req => req._id === requestId);
      
      if (!request) {
        addNotification('Request not found', 'error');
        return;
      }
      
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/parents/cancel-request/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      addNotification('Request cancelled successfully', 'info');
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));
      
      if (socket && request && request.userId) {
        socket.emit('parent-request-cancelled', {
          requestId: requestId,
          parentId: parent?._id,
          parentName: `${parent?.fullname?.firstname} ${parent?.fullname?.lastname}`,
          userId: request.userId,
          timestamp: new Date()
        });
      }
      
      setTimeout(() => loadParentData(), 500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error cancelling request';
      addNotification(errorMessage, 'error');
    }
  };

  const removeChild = async (childId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/parents/remove-child/${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setChildren(prev => prev.filter(child => child._id !== childId));
      
      if (selectedChild?._id === childId) {
        setSelectedChild(null);
        setCurrentRide(null);
        setCaptainLocation(null);
      }
      
      addNotification('Child removed successfully!', 'success');
      setTimeout(() => loadParentData(), 500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error removing child';
      addNotification(errorMessage, 'error');
    }
  };

  return {
    userEmail,
    setUserEmail,
    isSendingRequest,
    sendChildRequest,
    cancelRequest,
    removeChild
  };
};

export default useRequestHandlers;