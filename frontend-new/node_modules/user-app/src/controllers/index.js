import useUserData from './useUserData';
import useNotifications from './useNotifications';
import useSocketEvents from './useSocketEvents';
import useParentManagement from './useParentManagement';
import useRideManagement from './useRideManagement';
import useUIState from './useUIState';
import useGSAPs from './useGSAPs';

export const useHomeController = (socket, user, navigate, setUser) => {
  // all useStates used 
  const {
    pickup,setPickup,

    destination,setDestination,

    panelOpen,setPanelOpen,

    vehiclePanel,setVehiclePanel,

    confirmRidePanel,setConfirmRidePanel,

    vehicleFound,setVehicleFound,

    waitingForDriver,setWaitingForDriver,
    
    vehicleType,setVehicleType,

    showParentRequests,setShowParentRequests,

    showParentMenu,setShowParentMenu,

    mounted,setMounted,

    socketConnected,setSocketConnected
  } = useUIState();


  // notifications
  const {
    notifications,
    addNotification,
    removeNotification
  } = useNotifications();


  // Parent Management - MAKE SURE TO DESTRUCTURE ALL NEEDED FUNCTIONS
  const {
    currentParent,
    setCurrentParent,  // ADD THIS
    parentRequests,
    setParentRequests, // ADD THIS
    isLoadingParent,
    isLoadingRequests,
    fetchCurrentParent,
    loadParentRequests,
    refreshUserData,
    acceptParentRequest,
    rejectParentRequest,
    removeParent
  } = useParentManagement({
    socket,
    user,
    setUser,
    addNotification
    // REMOVE THESE: setCurrentParent and setParentRequests are already in the hook
  });



  const {
    ride,
    setRide,
    fare,
    calcFare,
    createRide,
    handlePickupChange,
    handleDestinationChange,
    submitHandler
  } = useRideManagement({
    pickup,setPickup,
    destination,setDestination,
    vehicleType,setVehiclePanel,
    addNotification
  });

  useSocketEvents({
    socket,
    user,
    navigate,
    addNotification,
    setRide,
    setVehicleFound,
    setWaitingForDriver,
    setParentRequests,  // NOW THIS IS DEFINED
    setCurrentParent,   // NOW THIS IS DEFINED
    refreshUserData,
    loadParentRequests,
    fetchCurrentParent,
    setSocketConnected
  });




  // all ref used in GSAP animation
  const {
    vehiclePanelRef,
    confirmRidePanelRef,
    vehicleFoundRef,
    waitingForDriverRef,
    panelRef,
    panelCloseRef,
    parentMenuRef,
    socketCleanupRef
  } = useGSAPs({
    panelOpen,
    vehiclePanel,
    confirmRidePanel,
    vehicleFound,
    waitingForDriver,
    showParentMenu,
    setShowParentMenu
  });



  return {
    // State
    pickup,
    setPickup,
    destination,
    setDestination,
    panelOpen,
    setPanelOpen,
    vehiclePanel,
    setVehiclePanel,
    confirmRidePanel,
    setConfirmRidePanel,
    vehicleFound,
    setVehicleFound,
    waitingForDriver,
    setWaitingForDriver,
    vehicleType,
    setVehicleType,
    showParentRequests,
    setShowParentRequests,
    showParentMenu,
    setShowParentMenu,
    mounted,
    currentParent,
    isLoadingParent,
    parentRequests,
    isLoadingRequests,
    notifications,
    socketConnected,
    
    // Ride state
    ride,
    fare,
    
    // Refs
    vehiclePanelRef,
    confirmRidePanelRef,
    vehicleFoundRef,
    waitingForDriverRef,
    panelRef,
    panelCloseRef,
    parentMenuRef,
    
    // Functions
    addNotification,
    removeNotification,
    acceptParentRequest,
    rejectParentRequest,
    removeParent,
    calcFare,
    createRide,
    handlePickupChange,
    handleDestinationChange,
    submitHandler,
    fetchCurrentParent,
    loadParentRequests,
    refreshUserData
  };
};