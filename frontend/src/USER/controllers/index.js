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


  const {
    currentParent,isLoadingParent,

    parentRequests,isLoadingRequests,

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
    setCurrentParent: () => {}, // Will be defined in context
    setParentRequests: () => {}, // Will be defined in context
    setIsLoadingParent: () => {}, // Will be defined in context
    setIsLoadingRequests: () => {}, // Will be defined in context
    addNotification
  });



  const {
    ride,
    setRide,
    fare,
    // setFare,
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
    setParentRequests,
    setCurrentParent,
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
    activeField,
    setActiveField,
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