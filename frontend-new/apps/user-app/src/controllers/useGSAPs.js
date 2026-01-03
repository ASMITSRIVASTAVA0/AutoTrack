import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const useGSAPs = ({
  panelOpen,
  vehiclePanel,
  confirmRidePanel,
  vehicleFound,
  waitingForDriver,
  showParentMenu,
  setShowParentMenu
}) => {
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const parentMenuRef = useRef(null);
  const socketCleanupRef = useRef({});

  // Close parent menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (parentMenuRef.current && !parentMenuRef.current.contains(event.target)) {
        setShowParentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowParentMenu]);

  // Panel animations
  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: '100%',
        padding: 24,
        duration: 0.3
      });
      gsap.to(panelCloseRef.current, {
        opacity: 1,
        duration: 0.3
      });
    } else {
      gsap.to(panelRef.current, {
        height: '0%',
        padding: 0,
        duration: 0.3
      });
      gsap.to(panelCloseRef.current, {
        opacity: 0,
        duration: 0.3
      });
    }
  }, [panelOpen]);

  // Vehicle panel animation
  useGSAP(() => {
    if (vehiclePanel) {
      gsap.fromTo(vehiclePanelRef.current, 
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    } else {
      gsap.to(vehiclePanelRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      });
    }
  }, [vehiclePanel]);

  // Confirm ride panel animation
  useGSAP(() => {
    if (confirmRidePanel) {
      gsap.fromTo(confirmRidePanelRef.current, 
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    } else {
      gsap.to(confirmRidePanelRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      });
    }
  }, [confirmRidePanel]);

  // Vehicle found animation
  useGSAP(() => {
    if (vehicleFound) {
      gsap.fromTo(vehicleFoundRef.current, 
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    } else {
      gsap.to(vehicleFoundRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      });
    }
  }, [vehicleFound]);

  // Waiting for driver animation
  useGSAP(() => {
    if (waitingForDriver) {
      gsap.fromTo(waitingForDriverRef.current, 
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    } else {
      gsap.to(waitingForDriverRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      });
    }
  }, [waitingForDriver]);

  // Parent menu animation
  useGSAP(() => {
    if (showParentMenu) {
      gsap.fromTo('.parent-menu-dropdown', 
        { scale: 0.8, opacity: 0, y: -10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [showParentMenu]);

  return {
    vehiclePanelRef,
    confirmRidePanelRef,
    vehicleFoundRef,
    waitingForDriverRef,
    panelRef,
    panelCloseRef,
    parentMenuRef,
    socketCleanupRef
  };
};

export default useGSAPs;