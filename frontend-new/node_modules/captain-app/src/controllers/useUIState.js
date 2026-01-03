


// store all useState hooks used


import { useState, useEffect } from 'react';

const useUIState = () => {
  const [mounted, setMounted] = useState(false);
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ride, setRide] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    mounted,setMounted,

    ridePopupPanel,setRidePopupPanel,

    confirmRidePopupPanel,setConfirmRidePopupPanel,

    isOnline,setIsOnline,

    activeSection,setActiveSection,

    isSidebarOpen,setIsSidebarOpen,

    ride,setRide
  };
};

export default useUIState;