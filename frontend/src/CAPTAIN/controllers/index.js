import useMouseTracking from './useMouseTracking';
import useCaptainData from './useCaptainData';
import useNotifications from './useNotifications';
import useSocketEvents from './useSocketEvents';
import useRideHandling from './useRideHandling';
import useUIState from './useUIState';

import useGSAPs from './useGSAP';
import useEffectCaptainLocationTracking from './useEffectCaptainLocationTracking';

export const useCaptainHomeController = (socket, captain) => {
  // import all useState hooks
  const {
    mounted,setMounted,

    ridePopupPanel,setRidePopupPanel,

    confirmRidePopupPanel,setConfirmRidePopupPanel,

    isOnline,setIsOnline,

    activeSection,setActiveSection,

    isSidebarOpen,setIsSidebarOpen,

    ride,setRide
  } = useUIState();



  const { mousePosition, parallaxLayers } = useMouseTracking();


  
  // allnotifications, addNotification(), removeNotification()
  const {
    notifications,
    addNotification,
    removeNotification
  } = useNotifications();



  // captain's useState hooks
  const {
    stats,setStats,

    captainLocation,setCaptainLocation,

    pulseAnimation,

    setPulseAnimation

  } = useCaptainData();



  // confirmRide() only
  const {
    confirmRide
  } = useRideHandling({
    captain,
    addNotification,
    setStats
  });


  

  // Now we can use setRidePopupPanel here
  useSocketEvents({
    socket,
    captain,
    setRide,
    setRidePopupPanel,
    addNotification
  });

  

  // useEffect code to track captain location
  useEffectCaptainLocationTracking({
    socket,
    captain,
    captainLocation,
    setCaptainLocation,
    setPulseAnimation,
    addNotification
  });



  // props me compo passed, then created useRef for those components, and used in useGSAP to animate those components
  const {
    ridePopupPanelRef,//get useRef for 
    confirmRidePopupPanelRef
  } = useGSAPs({
    ridePopupPanel,//passed compo and get useRef for those components
    confirmRidePopupPanel
  });



  return {
    // State
    mousePosition,
    parallaxLayers,
    mounted,
    ridePopupPanel,
    confirmRidePopupPanel,
    isOnline,
    captainLocation,
    notifications,
    stats,
    pulseAnimation,
    activeSection,
    setActiveSection,
    isSidebarOpen,
    ride,
    
    // Refs for GSAP animations
    ridePopupPanelRef,
    confirmRidePopupPanelRef,

    
    // Functions
    addNotification,
    removeNotification,
    confirmRide,
    setIsOnline,
    setIsSidebarOpen,
    setRidePopupPanel,
    setConfirmRidePopupPanel
  };
};