import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useParentManagement = ({
  socket,
  user,
  setUser,
  addNotification
}) => {
  const [currentParent, setCurrentParent] = useState(null);
  const [parentRequests, setParentRequests] = useState([]);
  const [isLoadingParent, setIsLoadingParent] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const fetchCurrentParent = useRef(async () => {
    try {
      setIsLoadingParent(true);
      
      console.log('Fetching parent for user:', user?._id);
      
      if (!user?._id) {
        console.log('No user found');
        setCurrentParent(null);
        return;
      }
      
      const token = localStorage.getItem("tokenUser");
      if (!token) {
        console.error('No token found');
        setCurrentParent(null);
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/get-parent`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      console.log('Parent fetch response:', response.data);
      
      if (response.data.parent && response.data.parent._id) {
        console.log('Setting currentParent:', response.data.parent);
        setCurrentParent(response.data.parent);
      } else {
        console.log('No parent data in response');
        setCurrentParent(null);
      }
    } catch (error) {
      console.error('Error fetching parent:', error);
      console.error('Error details:', error.response?.data || error.message);
      setCurrentParent(null);
    } finally {
      setIsLoadingParent(false);
    }
  }).current;

  const loadParentRequests = useRef(async () => {
    try {
      setIsLoadingRequests(true);
      const token = localStorage.getItem('tokenUser');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user-parents/pending-parent-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      setParentRequests(response.data.pendingRequests || []);
    } catch (error) {
      console.error('Error loading parent requests:', error);
      addNotification('Failed to load parent requests', 'error');
    } finally {
      setIsLoadingRequests(false);
    }
  }).current;

  const refreshUserData = useRef(async () => {
    try {
      const token = localStorage.getItem('tokenUser');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      if (response.data && response.data.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        
        console.log('Updated user context with parentId:', updatedUser.parentId);
        
        if (updatedUser.parentId) {
          setTimeout(() => {
            fetchCurrentParent();
          }, 300);
        } else {
          setCurrentParent(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }).current;

  const acceptParentRequest = async (requestId, parentId) => {
    try {
      setIsLoadingRequests(true);
      const token = localStorage.getItem('tokenUser');
      
      console.log("Accepting request:", requestId, "for parent:", parentId);
      
      if (!requestId) {
        addNotification('Invalid request ID', 'error');
        return;
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user-parents/accept-parent-request/${requestId}`,
        { parentId },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      console.log("Accept parent req response:", response.data);
      
      setParentRequests(prev => prev.filter(req => req._id !== requestId));
      
      if (socket) {
        socket.emit('parent-request-accepted', {
          parentId: parentId,
          userId: user?._id,
          userName: `${user?.fullname?.firstname} ${user?.fullname?.lastname}`,
          requestId: requestId
        });
      }
      
      await refreshUserData();
      
      addNotification('Parent request accepted successfully!', 'success');
      
    } catch (error) {
      console.error('Error accepting parent request:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error accepting request';
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const rejectParentRequest = async (requestId, parentId) => {
    try {
      console.log("Reject parent req called, requestId=", requestId, "parentId=", parentId);
      setIsLoadingRequests(true);
      const token = localStorage.getItem('tokenUser');
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user-parents/reject-parent-request/${requestId}`,
        { parentId },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      console.log("Reject response:", response.data);
      
      setParentRequests(prev => prev.filter(req => req._id !== requestId));
      
      if (socket) {
        socket.emit('parent-request-rejected', {
          parentId: parentId,
          userId: user?._id,
          userName: `${user?.fullname?.firstname} ${user?.fullname?.lastname}`,
          requestId: requestId
        });
      }
      
      addNotification('Parent request rejected successfully.', 'info');
      
    } catch (error) {
      console.error('Error rejecting parent request:', error);
      const errorMessage = error.response?.data?.message || 'Error rejecting request';
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const removeParent = async () => {
    if (!user?.parentId) {
      addNotification('No parent to remove', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this parent? This will disconnect you from their monitoring.')) {
      return;
    }

    try {
      setIsLoadingParent(true);
      const token = localStorage.getItem('tokenUser');
      const oldParentId = user.parentId;
      
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/users/remove-parent`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      console.log("Remove parent response:", response.data);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        
        if (socket) {
          socket.emit('parent-removed', {
            parentId: oldParentId,
            userId: user._id,
            userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
            userEmail: user.email
          });
          
          socket.emit('parent-removed-success', {
            parentId: oldParentId,
            userId: user._id
          });
        }
        
        setCurrentParent(null);
        
        addNotification('Parent removed successfully', 'success');
      }
      
    } catch (error) {
      console.error('Error removing parent:', error);
      const errorMessage = error.response?.data?.message || 'Error removing parent';
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoadingParent(false);
    }
  };

  return {
    currentParent,
    setCurrentParent,
    parentRequests,
    setParentRequests,
    isLoadingParent,
    setIsLoadingParent,
    isLoadingRequests,
    setIsLoadingRequests,
    fetchCurrentParent,
    loadParentRequests,
    refreshUserData,
    acceptParentRequest,
    rejectParentRequest,
    removeParent
  };
};

export default useParentManagement;