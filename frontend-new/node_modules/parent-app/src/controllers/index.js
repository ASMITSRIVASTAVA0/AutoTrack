import useParentData from './useParentData';
import useNotifications from './useNotifications';
import useSocketEvents from './useSocketEvents';
import useRequestHandlers from './useRequestHandlers';
import useChildTracking from './useChildTracking';
import useMouseTracking from './useMouseTracking';
import useRideHistory from './useRideHistory';

export const useParentHomeController = (socket, parent) => {
  const { mousePosition } = useMouseTracking();
  const { notifications, addNotification, removeNotification, markNotificationAsRead, clearNotifications } = useNotifications();
  
  const {
    children,
    pendingRequests,
    isLoading,
    isRefreshing,
    loadParentData
  } = useParentData(addNotification);

  const {
    selectedChild,
    setSelectedChild,
    currentRide,
    setCurrentRide,
    captainLocation,
    setCaptainLocation,
    mapCenter,
    setMapCenter,
    pulseAnimation,
    setPulseAnimation,
    trackChildCaptainLocation,
    getRoutePolyline,
    sendMessageToChild,
    manualRefresh
  } = useChildTracking({
    children,
    addNotification,
    loadParentData
  });

  const {
    rideHistory,
    showRideHistory,
    setShowRideHistory,
    loadRideHistory
  } = useRideHistory(addNotification);

  const {
    userEmail,
    setUserEmail,
    isSendingRequest,
    sendChildRequest,
    cancelRequest,
    removeChild
  } = useRequestHandlers({
    socket,
    parent,
    addNotification,
    loadParentData,
    pendingRequests,
    selectedChild,
    setSelectedChild,
    setCurrentRide,
    setCaptainLocation
  });

  useSocketEvents({
    socket,
    parent,
    selectedChild,
    setSelectedChild,
    setCurrentRide,
    setCaptainLocation,
    setPendingRequests: (updater) => {
      // You need to pass the setPendingRequests function from useParentData
      // Or handle this differently
    },
    setChildren: (updater) => {
      // You need to pass the setChildren function from useParentData
    },
    loadParentData,
    addNotification
  });

  return {
    // State
    mousePosition,
    children,
    pendingRequests,
    selectedChild,
    setSelectedChild,
    isLoading,
    rideHistory,
    userEmail,
    setUserEmail,
    currentRide,
    captainLocation,
    mapCenter,
    notifications,
    isSendingRequest,
    showRideHistory,
    setShowRideHistory,
    pulseAnimation,
    isRefreshing,
    
    // Functions
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearNotifications,
    sendChildRequest,
    cancelRequest,
    removeChild,
    trackChildCaptainLocation,
    loadRideHistory,
    getRoutePolyline,
    sendMessageToChild,
    manualRefresh,
    loadParentData
  };
};