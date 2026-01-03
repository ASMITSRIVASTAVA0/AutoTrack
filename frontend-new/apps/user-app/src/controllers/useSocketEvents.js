import { useEffect, useRef } from 'react';

const useSocketEvents = ({
  socket,
  user,
  navigate,
  addNotification,
  setRide,
  setVehicleFound,
  setWaitingForDriver,
  setParentRequests,
  setCurrentParent,
  refreshUserData,
  loadParentRequests,
  fetchCurrentParent,
  setSocketConnected
}) => {
  const socketCleanupRef = useRef({});

  useEffect(() => {
    if (!user || !socket) return;

    // Clean up previous listeners
    Object.values(socketCleanupRef.current).forEach(cleanup => cleanup?.());
    socketCleanupRef.current = {};

    // Join user room
    socket.emit("join", { userType: "user", userId: user._id });
    setSocketConnected(true);
    console.log(`User ${user._id} joined socket room`);

    // Load initial data
    loadParentRequests();

    // Define handlers
    const handleRideConfirmed = (data) => {
      console.log("Ride confirmed:", data);
      const rideData = data.ride || data;
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRide(rideData);
      addNotification('Ride confirmed! Captain is on the way.', 'success');
    };

    const handleRideStarted = (data) => {
      console.log("Ride started:", data);
      const rideData = data.ride || data;
      setWaitingForDriver(false);
      navigate('/users/riding', { state: { ride: rideData } });
    };

    const handleParentRequestReceived = (data) => {
      console.log('Parent request received:', data);
      
      // Check if request already exists
      setParentRequests(prev => {
        const existingRequest = prev.find(req => 
          req._id === data.requestId || 
          (req.parentId === data.parentId && req.status === 'pending')
        );
        
        if (existingRequest) {
          console.log('Duplicate parent request received, ignoring');
          return prev;
        }

        const newRequest = {
          _id: data.requestId,
          parentId: data.parentId,
          parentName: data.parentName,
          timestamp: new Date(data.timestamp || Date.now()),
          status: 'pending'
        };
        
        addNotification(`New parent request from ${data.parentName}`, 'info');
        
        return [newRequest, ...prev];
      });
    };

    const handleParentRequestsList = (data) => {
      console.log('Parent requests list:', data);
      setParentRequests(data.pendingRequests || []);
    };

    const handleParentRequestCancelled = (data) => {
      console.log('Parent request cancelled:', data);
      
      setParentRequests(prev => prev.filter(req => 
        req._id !== data.requestId && 
        req.parentId !== data.parentId
      ));
      
      addNotification(`Parent request from ${data.parentName} has been withdrawn.`, 'info');
    };

    const handleParentRemovedSuccess = (data) => {
      console.log('Parent removed successfully:', data);
      addNotification('Parent removed successfully', 'success');
      setCurrentParent(null);
      refreshUserData();
    };

    const handleParentStatusChanged = (data) => {
      console.log('Parent status changed:', data);
      
      if (data.status === 'connected' && data.parentId) {
        fetchCurrentParent();
      } else if (data.status === 'removed') {
        setCurrentParent(null);
        addNotification('Parent removed successfully', 'success');
      }
    };

    const handleParentStatusUpdated = (data) => {
      console.log('Parent status updated:', data);
      if (data.hasParent === false) {
        setCurrentParent(null);
      } else {
        fetchCurrentParent();
      }
    };

    const handleReconnect = () => {
      console.log('Socket reconnected, rejoining room');
      if (user?._id) {
        socket.emit("join", { userType: "user", userId: user._id });
        loadParentRequests();
        fetchCurrentParent();
      }
    };

    const handleSocketError = (error) => {
      console.error('Socket error:', error);
      addNotification('Connection error. Please check your internet.', 'error');
    };

    const handleConnect = () => {
      console.log('Socket connected');
      setSocketConnected(true);
      if (user?._id) {
        socket.emit("join", { userType: "user", userId: user._id });
        loadParentRequests();
      }
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    };

    // Set up event listeners
    socket.on('ride-confirmed', handleRideConfirmed);
    socket.on('ride-started', handleRideStarted);
    socket.on('parent-request-received', handleParentRequestReceived);
    socket.on('parent-requests-list', handleParentRequestsList);
    socket.on('parent-request-cancelled', handleParentRequestCancelled);
    socket.on('parent-removed-success', handleParentRemovedSuccess);
    socket.on('parent-status-changed', handleParentStatusChanged);
    socket.on('parent-status-updated', handleParentStatusUpdated);
    socket.on('reconnect', handleReconnect);
    socket.on('error', handleSocketError);
    socket.on('connect_error', handleSocketError);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Store cleanup functions
    socketCleanupRef.current = {
      rideConfirmed: () => socket.off('ride-confirmed', handleRideConfirmed),
      rideStarted: () => socket.off('ride-started', handleRideStarted),
      parentRequestReceived: () => socket.off('parent-request-received', handleParentRequestReceived),
      parentRequestsList: () => socket.off('parent-requests-list', handleParentRequestsList),
      parentRequestCancelled: () => socket.off('parent-request-cancelled', handleParentRequestCancelled),
      parentRemovedSuccess: () => socket.off('parent-removed-success', handleParentRemovedSuccess),
      parentStatusChanged: () => socket.off('parent-status-changed', handleParentStatusChanged),
      parentStatusUpdated: () => socket.off('parent-status-updated', handleParentStatusUpdated),
      reconnect: () => socket.off('reconnect', handleReconnect),
      error: () => socket.off('error', handleSocketError),
      connectError: () => socket.off('connect_error', handleSocketError),
      connect: () => socket.off('connect', handleConnect),
      disconnect: () => socket.off('disconnect', handleDisconnect)
    };

    // Cleanup function
    return () => {
      Object.values(socketCleanupRef.current).forEach(cleanup => cleanup?.());
    };
  }, [socket, user, navigate]);
};

export default useSocketEvents;