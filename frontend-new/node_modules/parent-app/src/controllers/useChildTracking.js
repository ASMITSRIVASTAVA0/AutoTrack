import { useState, useEffect } from 'react';
import axios from 'axios';

const useChildTracking = ({
  children,
  addNotification,
  loadParentData
}) => {
  const [selectedChild, setSelectedChildLocal] = useState(null);
  const [currentRide, setCurrentRideLocal] = useState(null);
  const [captainLocation, setCaptainLocationLocal] = useState(null);
  const [mapCenter, setMapCenterLocal] = useState([28.6139, 77.2090]);
  const [pulseAnimation, setPulseAnimationLocal] = useState(false);

  // Updated: Use different names for setter functions
  const updateSelectedChild = (child) => {
    setSelectedChildLocal(child);
    if (!child) {
      setCurrentRideLocal(null);
      setCaptainLocationLocal(null);
    }
  };

  const updateCurrentRide = (ride) => setCurrentRideLocal(ride);
  const updateCaptainLocation = (location) => setCaptainLocationLocal(location);
  const updateMapCenter = (center) => setMapCenterLocal(center);
  const updatePulseAnimation = (animation) => setPulseAnimationLocal(animation);

  const trackChildCaptainLocation = async (childId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/parents/child-location/${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setCaptainLocationLocal(response.data.currentRide?.captain.location);
      setCurrentRideLocal(response.data.currentRide);
      
      const child = children.find(c => c._id === childId);
      if (child) {
        setSelectedChildLocal(child);
      }

      if (response.data.location) {
        setMapCenterLocal([
          response.data.currentRide?.captain.location.coordinates[1],
          response.data.currentRide?.captain.location.coordinates[0]
        ]);
      }

      addNotification(`Now tracking ${child?.fullname?.firstname}'s location via captain location`, 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error tracking child location';
      addNotification(errorMessage, 'error');
    }
  };

  const getRoutePolyline = () => {
    if (!currentRide || !captainLocation) return [];
    
    const captainLatLng = [captainLocation.coordinates[1], captainLocation.coordinates[0]];
    
    if (currentRide.status === 'accepted' && currentRide.pickup && currentRide.pickup.location) {
      const pickupLatLng = [
        currentRide.pickup.location.coordinates[1],
        currentRide.pickup.location.coordinates[0]
      ];
      return [captainLatLng, pickupLatLng];
    } else if (currentRide.status === 'ongoing' && currentRide.destination && currentRide.destination.location) {
      const destinationLatLng = [
        currentRide.destination.location.coordinates[1],
        currentRide.destination.location.coordinates[0]
      ];
      return [captainLatLng, destinationLatLng];
    }
    
    return [];
  };

  const sendMessageToChild = () => {
    if (!currentRide?.captain) {
      addNotification('No captain assigned to current ride', 'error');
      return;
    }
    addNotification(`Message feature coming soon for Captain ${currentRide.captain.fullname?.firstname}`, 'info');
  };

  const manualRefresh = () => {
    loadParentData();
    if (selectedChild) {
      trackChildCaptainLocation(selectedChild._id);
    }
  };

  return {
    selectedChild,
    setSelectedChild: updateSelectedChild,
    currentRide,
    setCurrentRide: updateCurrentRide,
    captainLocation,
    setCaptainLocation: updateCaptainLocation,
    mapCenter,
    setMapCenter: updateMapCenter,
    pulseAnimation,
    setPulseAnimation: updatePulseAnimation,
    trackChildCaptainLocation,
    getRoutePolyline,
    sendMessageToChild,
    manualRefresh
  };
};

export default useChildTracking;