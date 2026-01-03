import { useState, useEffect } from 'react';

const useUIState = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  // const [activeField, setActiveField] = useState(null);
  const [vehicleType, setVehicleType] = useState(null);
  const [showParentRequests, setShowParentRequests] = useState(false);
  const [showParentMenu, setShowParentMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return {
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
    // activeField,
    // setActiveField,
    vehicleType,
    setVehicleType,
    showParentRequests,
    setShowParentRequests,
    showParentMenu,
    setShowParentMenu,
    mounted,
    socketConnected,
    setSocketConnected
  };
};

export default useUIState;