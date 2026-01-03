import { useEffect, useRef } from 'react';

const useSocketEvents = ({
  socket,
  parent,
  selectedChild,
  setSelectedChild,
  setCurrentRide,
  setCaptainLocation,
  setPendingRequests,
  setChildren,
  loadParentData,
  addNotification
}) => {
  const isMounted = useRef(false);
  const hasJoined = useRef(false);
  const socketCleanupRef = useRef({});
  const selectedChildRef = useRef(selectedChild);

  useEffect(() => {
    selectedChildRef.current = selectedChild;
  }, [selectedChild]);

  useEffect(() => {
    if (!parent || !socket || isMounted.current) return;
    
    isMounted.current = true;
    
    // Initial join
    if (!hasJoined.current && socket.connected) {
      socket.emit("join", { userType: "parent", userId: parent._id });
      hasJoined.current = true;
    }

    // Load initial data
    loadParentData();
    
    // Clean up previous listeners
    Object.values(socketCleanupRef.current).forEach(cleanup => cleanup?.());
    
    // Event handlers
    const handleParentRequestAccepted = (data) => {
      addNotification(`${data.userName} accepted your parent request!`, 'success');
      loadParentData();
    };

    const handleParentRequestRejected = (data) => {
      addNotification(`${data.userName} rejected your parent request.`, 'error');
      
      setPendingRequests(prev => {
        if (!prev || !Array.isArray(prev)) return prev;
        
        const filtered = prev.filter(req => {
          const reqId = req._id?.toString?.() || req._id;
          const dataId = data.requestId?.toString?.() || data.requestId;
          const reqUserId = req.userId?._id?.toString?.() || req.userId?.toString?.() || req.userId;
          const dataUserId = data.userId?.toString?.() || data.userId;
          
          const isRequestMatch = reqId === dataId;
          const isUserMatch = reqUserId === dataUserId;
          
          return !isRequestMatch && !isUserMatch;
        });
        
        return filtered;
      });
      
      setTimeout(() => loadParentData(), 300);
    };

    const handleChildRemovedNotification = (data) => {
      setChildren(prev => prev.filter(child => 
        child._id !== data.userId && child.email !== data.userEmail
      ));
      
      const currentSelected = selectedChildRef.current;
      if (currentSelected && (currentSelected._id === data.userId || currentSelected.email === data.userEmail)) {
        setSelectedChild(null);
        setCurrentRide(null);
        setCaptainLocation(null);
      }
      
      addNotification(`❌ ${data.userName} (${data.userEmail}) has removed you as their parent.`, 'error', true);
      setTimeout(() => loadParentData(), 500);
    };

    const handleRideAcceptedNotification = (notification) => {
      addNotification(notification.message, 'success');
      loadParentData();
    };

    const handleChildRideStarted = (data) => {
      addNotification(`🚗 Ride started for ${data.childName}`, 'success');
      loadParentData();
    };

    const handleChildRideEnded = (data) => {
      addNotification(`Ride completed for ${data.userName}. Fare: ₹${data.fare}`, 'success');
      loadParentData();
    };

    const handleChildrenListUpdated = (data) => {
      loadParentData();
      addNotification('Children list updated, new child added', 'info');
    };

    const handleRefreshChildrenList = (data) => {
      loadParentData();
    };

    const handlePendingRequestsUpdated = (data) => {
      loadParentData();
    };

    const handleSocketConnected = () => {
      if (parent?._id) {
        socket.emit("join", { userType: "parent", userId: parent._id });
      }
    };

    const handleReconnect = () => {
      if (parent?._id) {
        socket.emit("join", { userType: "parent", userId: parent._id });
        loadParentData();
      }
    };

    const handleSocketError = (error) => {
      addNotification('Connection error. Please check your internet.', 'error');
    };

    // Set up event listeners
    socket.on('parent-request-accepted-notification', handleParentRequestAccepted);
    socket.on('parent-request-rejected-notification', handleParentRequestRejected);
    socket.on('child-removed-notification', handleChildRemovedNotification);
    socket.on('children-list-updated', handleChildrenListUpdated);
    socket.on('refresh-children-list', handleRefreshChildrenList);
    socket.on('pending-requests-updated', handlePendingRequestsUpdated);
    socket.on('childride-accepted-notifyPar', handleRideAcceptedNotification);
    socket.on('child-ride-started', handleChildRideStarted);
    socket.on('child-ride-ended', handleChildRideEnded);
    socket.on('connect', handleSocketConnected);
    socket.on('reconnect', handleReconnect);
    socket.on('error', handleSocketError);
    socket.on('connect_error', handleSocketError);

    // Store cleanup functions
    socketCleanupRef.current = {
      parentRequestAccepted: () => socket.off('parent-request-accepted-notification', handleParentRequestAccepted),
      parentRequestRejected: () => socket.off('parent-request-rejected-notification', handleParentRequestRejected),
      childRemovedNotification: () => socket.off('child-removed-notification', handleChildRemovedNotification),
      childrenListUpdated: () => socket.off('children-list-updated', handleChildrenListUpdated),
      refreshChildrenList: () => socket.off('refresh-children-list', handleRefreshChildrenList),
      pendingRequestsUpdated: () => socket.off('pending-requests-updated', handlePendingRequestsUpdated),
      rideAcceptedNotification: () => socket.off('childride-accepted-notifyPar', handleRideAcceptedNotification),
      childRideStarted: () => socket.off('child-ride-started', handleChildRideStarted),
      childRideEnded: () => socket.off('child-ride-ended', handleChildRideEnded),
      connect: () => socket.off('connect', handleSocketConnected),
      reconnect: () => socket.off('reconnect', handleReconnect),
      error: () => socket.off('error', handleSocketError),
      connectError: () => socket.off('connect_error', handleSocketError)
    };

    // Cleanup function
    return () => {
      Object.values(socketCleanupRef.current).forEach(cleanup => cleanup?.());
    };
  }, [socket, parent, loadParentData]);
};

export default useSocketEvents;