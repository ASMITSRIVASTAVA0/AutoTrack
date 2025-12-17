import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
import { ParentDataContext } from '../context/ParentContext';
import { Link } from 'react-router-dom';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Pink theme icons - custom markers
const childIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

const captainIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

const pickupIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

const destinationIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

// Map updater component
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

const ParentHome = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [children, setChildren] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  const [childStats, setChildStats] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [childLocation, setChildLocation] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [notifications, setNotifications] = useState([]);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [showRideHistory, setShowRideHistory] = useState(false);
  const [showChildDetails, setShowChildDetails] = useState(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const { socket } = useContext(SocketContext);
  const { parent } = useContext(ParentDataContext);
  const mapRef = useRef();
  
  // New refs to track mounted state and prevent duplicate logs
  const isMounted = useRef(false);
  const hasJoined = useRef(false);
  const isLoadingData = useRef(false);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load parent data on component mount - optimized with useCallback
  const loadParentData = useCallback(async () => {
    if (isLoadingData.current) return; // Prevent concurrent calls
    
    try {
      isLoadingData.current = true;
      setIsLoading(true);
      const token = localStorage.getItem('tokenParent');
      
      // Get parent profile
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/parents/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log("Parent profile response:", response.data);
      
      // Correctly extract parent data
      const parentData = response.data.parent;
      if (parentData && parentData.children) {
        setChildren(parentData.children || []);
      } else {
        setChildren([]);
      }
      
      // Load pending requests
      const requestsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/parents/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log("Pending requests response:", requestsResponse.data);
      
      // Correctly extract pending requests
      if (requestsResponse.data && requestsResponse.data.requests) {
        setPendingRequests(requestsResponse.data.requests || []);
      } else {
        setPendingRequests([]);
      }
      
    } catch (error) {
      console.error('Error loading parent data:', error);
      console.error('Error details:', error.response?.data || error.message);
      addNotification('Error loading parent data: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setIsLoading(false);
      isLoadingData.current = false;
    }
  }, []);

  // Load ride history for a child
  const loadRideHistory = async (childId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/parents/child-rides/${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      setRideHistory(response.data.rides || []);
    } catch (error) {
      console.error('Error loading ride history:', error);
      addNotification('Error loading ride history', 'error');
    }
  };

  // Load child statistics
  const loadChildStats = async (childId) => {
    try {
      const token = localStorage.getItem('tokenParent');

      // currently route not made
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/parents/child-stats/${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      setChildStats(prev => ({
        ...prev,
        [childId]: response.data.stats
      }));
    } catch (error) {
      console.error('Error loading child stats:', error);
    }
  };

  // Enhanced Notification system with animations
  const addNotification = (message, type = 'info', urgent = false) => {
    const id = Date.now();
    const notification = { 
      id, 
      message, 
      type, 
      timestamp: new Date(),
      urgent,
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    if (urgent) {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    if (!urgent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, 8000);
    }
  };

  // EFFECT 1: Initial join and load data (runs once)
  useEffect(() => {
    if (!parent || !socket || isMounted.current) return;
    
    isMounted.current = true;
    
    // Only join once
    if (!hasJoined.current) {
      socket.emit('parent-join', parent._id);
      hasJoined.current = true;
      console.log(`Parent ${parent._id} joined with socket ${socket.id}`);
    }
    
    // Load initial data
    loadParentData();
    
    // Event handlers that are independent of selectedChild
    const handleParentRequestAccepted = (data) => {
      console.log('Parent request accepted:', data);
      addNotification(`${data.userName} accepted your parent request!`, 'success');
      loadParentData();
    };

    const handleParentRequestRejected = (data) => {
      console.log('Parent request rejected:', data);
      addNotification(`${data.userName} rejected your parent request.`, 'error');
      setPendingRequests(prev => prev.filter(req => 
        !(req.userId === data.userId || req._id === data.requestId)
      ));
    };

    const handleSocketError = (error) => {
      console.error('Socket error:', error);
      addNotification('Connection error. Please check your internet.', 'error');
    };

    // Set up independent event listeners
    socket.on('parent-request-accepted-notification', handleParentRequestAccepted);
    socket.on('parent-request-rejected-notification', handleParentRequestRejected);
    socket.on('error', handleSocketError);
    socket.on('connect_error', handleSocketError);

    // Cleanup function
    return () => {
      socket.off('parent-request-accepted-notification', handleParentRequestAccepted);
      socket.off('parent-request-rejected-notification', handleParentRequestRejected);
      socket.off('error', handleSocketError);
      socket.off('connect_error', handleSocketError);
    };
  }, [parent, socket, loadParentData]);

  // EFFECT 2: Child-specific socket events (only runs when selectedChild changes)
  useEffect(() => {
    if (!socket || !selectedChild) return;

    // Child-specific event handlers
    const handleChildLocationUpdate = (data) => {
      console.log('Child location updated:', data);
      if (data.userId === selectedChild._id) {
        setChildLocation(data.location);
        setMapCenter([data.location.coordinates[1], data.location.coordinates[0]]);
        addNotification(`${data.userName}'s location updated`, 'info');
      }
    };

    const handleCaptainLocationUpdate = (data) => {
      console.log('Captain location updated:', data);
      if (data.childId === selectedChild._id) {
        setCaptainLocation(data.location);
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 1000);
      }
    };

    const handleChildRideStarted = (data) => {
      console.log('Child ride started:', data);
      if (data.childId === selectedChild._id) {
        setCurrentRide(data.ride);
        addNotification(`🚗 Ride started for ${data.childName}`, 'success');
        // loadRideHistory(data.childId);
      }
    };

    const handleChildRideOngoing = (data) => {
      console.log('Child ride ongoing:', data);
      if (data.childId === selectedChild._id) {
        addNotification(`Ride ongoing for ${data.childName} with captain ${data.captain.name}`, 'info');
      }
    };

    const handleChildRideEnded = (data) => {
      console.log('Child ride ended:', data);
      if (data.childId === selectedChild._id) {
        setCurrentRide(null);
        setCaptainLocation(null);
        addNotification(`Ride completed for ${data.childName}. Fare: ₹${data.fare}`, 'success');
        loadRideHistory(data.childId);
        loadChildStats(selectedChild._id);
      }
    };

    const handleRideAcceptedNotification = (notification) => {
      console.log('Ride accepted notification:', notification);
      addNotification(notification.message, 'success');
    };

    // Set up child-specific event listeners
    socket.on('child-location-updated', handleChildLocationUpdate);
    socket.on('captain-location-update', handleCaptainLocationUpdate);
    socket.on('child-ride-started', handleChildRideStarted);
    socket.on('child-ride-ongoing', handleChildRideOngoing);
    socket.on('child-ride-ended', handleChildRideEnded);
    socket.on('ride-accepted-notification', handleRideAcceptedNotification);

    // Cleanup function for child-specific events
    return () => {
      socket.off('child-location-updated', handleChildLocationUpdate);
      socket.off('captain-location-update', handleCaptainLocationUpdate);
      socket.off('child-ride-started', handleChildRideStarted);
      socket.off('child-ride-ongoing', handleChildRideOngoing);
      socket.off('child-ride-ended', handleChildRideEnded);
      socket.off('ride-accepted-notification', handleRideAcceptedNotification);
    };
  }, [socket, selectedChild]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const sendChildRequest = async (e) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      addNotification('Please enter a valid email', 'error');
      return;
    }

    try {
      setIsSendingRequest(true);
      const token = localStorage.getItem('tokenParent');
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/parents/send-request`, 
        { userEmail }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const requestId=response.data.requestId;
      
      addNotification('Request sent successfully!', 'success');
      setUserEmail('');
      loadParentData();

      // Notify user via socket
      if (socket && parent) {
        socket.emit('parent-request-sent', {
          userEmail: userEmail,
          parentId: parent._id,
          requestId:requestId
        });
      }

    } catch (error) {
      console.error('Error sending child request:', error);
      const errorMessage = error.response?.data?.message || 'Error sending request. Please try again.';
      addNotification(errorMessage, 'error');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const acceptChildRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/parents/add-child`, 
        { requestId }, 
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      addNotification('Child added successfully!', 'success');
      loadParentData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error accepting request';
      addNotification(errorMessage, 'error');
    }
  };

  const cancelRequest = async (requestId) => {
    try {
        const token = localStorage.getItem('tokenParent');
        
        // First get the request details before cancelling
        const request = pendingRequests.find(req => req._id === requestId);
        
        await axios.delete(
            `${import.meta.env.VITE_BASE_URL}/parents/cancel-request/${requestId}`, 
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
            }
        );
        
        addNotification('Request cancelled successfully', 'info');
        
        // Emit socket event to notify user
        if (socket && request && request.userId) {
            socket.emit('parent-request-cancelled', {
                requestId: requestId,
                parentId: parent?._id,
                parentName: `${parent?.fullname?.firstname} ${parent?.fullname?.lastname}`,
                userId: request.userId,
                timestamp: new Date()
            });
        }
        
        loadParentData();
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error cancelling request';
        addNotification(errorMessage, 'error');
    }
  };


  const removeChild = async (childId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/parents/remove-child/${childId}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      setChildren(children.filter(child => child._id !== childId));
      if (selectedChild?._id === childId) {
        setSelectedChild(null);
        setChildLocation(null);
        setCurrentRide(null);
        setCaptainLocation(null);
      }
      addNotification('Child removed successfully!', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error removing child';
      addNotification(errorMessage, 'error');
    }
  };

  const trackChildLocation = async (childId) => {
    try {
      const token = localStorage.getItem('tokenParent');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/parents/child-location/${childId}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setChildLocation(response.data.location);
      setCurrentRide(response.data.currentRide);
      
      // Find the child object
      const child = children.find(c => c._id === childId);
      setSelectedChild(child);

      // Update map center
      if (response.data.location) {
        setMapCenter([
          response.data.location.coordinates[1],
          response.data.location.coordinates[0]
        ]);
      }

      // Load child stats
      loadChildStats(childId);
      loadRideHistory(childId);

      addNotification(`Now tracking ${child.fullname?.firstname}'s location`, 'success');
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

  const sendMessageToCaptain = () => {
    if (!currentRide?.captain) {
      addNotification('No captain assigned to current ride', 'error');
      return;
    }
    addNotification(`Message feature coming soon for Captain ${currentRide.captain.fullname?.firstname}`, 'info');
  };

  // Notification Toast Component with animations
  const NotificationToast = () => (
    <div className="fixed top-20 right-5 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className={`p-4 rounded-2xl shadow-2xl border-l-4 animate-slideInRight
            ${notification.type === 'success' 
              ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-emerald-500 text-emerald-100'
              : notification.type === 'error'
              ? 'bg-gradient-to-r from-rose-900/90 to-rose-800/90 border-rose-500 text-rose-100'
              : notification.type === 'warning'
              ? 'bg-gradient-to-r from-amber-900/90 to-amber-800/90 border-amber-500 text-amber-100'
              : 'bg-gradient-to-r from-pink-900/90 to-purple-800/90 border-pink-500 text-pink-100'
            } ${notification.urgent ? 'animate-pulse border-l-8 shadow-[0_0_30px_rgba(255,0,100,0.5)]' : ''}`}
          style={{
            animationDelay: `${index * 100}ms`,
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
          }}
          onClick={() => markNotificationAsRead(notification.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className={`relative mt-1 ${
                notification.type === 'success' ? 'text-emerald-400' :
                notification.type === 'error' ? 'text-rose-400' :
                notification.type === 'warning' ? 'text-amber-400' :
                'text-pink-400'
              }`}>
                <div className={`absolute inset-0 ${
                  notification.type === 'success' ? 'bg-emerald-500/20' :
                  notification.type === 'error' ? 'bg-rose-500/20' :
                  notification.type === 'warning' ? 'bg-amber-500/20' :
                  'bg-pink-500/20'
                } rounded-full animate-ping`}></div>
                <i className={`relative z-10 ${
                  notification.type === 'success' ? 'ri-checkbox-circle-fill' :
                  notification.type === 'error' ? 'ri-error-warning-fill' :
                  notification.type === 'warning' ? 'ri-alert-fill' :
                  'ri-information-fill'
                }`}></i>
              </div>
              <div>
                <p className="font-medium text-sm">{notification.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="text-white/50 hover:text-white transition-colors ml-2 hover:scale-110 transition-transform"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          {!notification.read && (
            <div className="w-2 h-2 bg-pink-400 rounded-full absolute top-2 right-2 animate-pulse"></div>
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-hidden'>
        {/* Animated background */}
        <div className='absolute inset-0'>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className='absolute w-1 h-1 bg-pink-500/30 rounded-full'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className='relative z-10 text-center'>
          <div className='relative w-32 h-32 mx-auto mb-6'>
            <div className='absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full animate-ping opacity-20'></div>
            <div className='absolute inset-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-pink-500/50'>
              <i className="ri-user-heart-line text-4xl text-white animate-pulse"></i>
            </div>
          </div>
          <p className='text-white/80 font-semibold text-xl mb-2'>Loading Parent Dashboard</p>
          <p className='text-pink-400/60 text-sm animate-pulse'>Securing your child's safety...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 z-0'>
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 bg-pink-500/20 rounded-full'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
        
        {/* Gradient orbs */}
        <div className='absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse' style={{animationDelay: '1s'}}></div>
        
        {/* Grid pattern */}
        <div className='absolute inset-0 opacity-5'
          style={{
            backgroundImage: `linear-gradient(to right, #ec4899 1px, transparent 1px),
                             linear-gradient(to bottom, #ec4899 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-20px) translateX(10px) rotate(120deg); }
          66% { transform: translateY(10px) translateX(-10px) rotate(240deg); }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.6); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-glow {
          animation: glow 2s infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
        
        .floating-element {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>

      <NotificationToast />
      
      <div className='relative z-10 max-w-7xl mx-auto p-6'>
        {/* Header*/}
        <div className='flex justify-between items-center mb-8 animate-slideInUp'
          style={{ animationDelay: '100ms' }}
        >
          <div className='group relative'>
            <div className='absolute -inset-4 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
            <div className='relative'>
              <h1 
              className='text-4xl font-bold text-white' 
              >
                Parent Dashboard
              </h1>
              <p className='text-white/60 mt-2 flex items-center gap-2 group-hover:text-white/80 transition-colors'>
                <i className="ri-user-heart-line text-pink-400 animate-pulse"></i>
                Welcome back, <span className='text-pink-300 font-semibold'>{parent?.fullname?.firstname}</span>
              </p>
            </div>
          </div>
          
          <div className='flex gap-3'>
            <Link 
              to='/parent/logout' 
              className='relative h-12 w-12 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 flex items-center justify-center rounded-xl transition-all duration-300 shadow-2xl hover:shadow-rose-500/50 text-white hover:scale-110 active:scale-95 group'
            >
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
              <i className="text-lg ri-logout-box-r-line group-hover:rotate-180 transition-transform duration-500"></i>
            </Link>
          </div>
        </div>
        
        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="relative group animate-slideInUp mb-6" style={{ animationDelay: '200ms' }}>
            <div className='absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className='relative w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg'>
                    <i className="ri-notification-line text-white"></i>
                  </div>
                  Notifications ({notifications.length})
                </h3>
                <button
                  onClick={clearNotifications}
                  className="text-white/50 hover:text-white text-sm font-semibold flex items-center gap-1 hover:scale-105 transition-all"
                >
                  <i className="ri-close-line"></i>
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className={`text-sm p-3 rounded-lg border-l-4 ${
                    notification.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-100' 
                      : notification.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-100'
                      : 'bg-blue-500/10 border-blue-500 text-blue-100'
                  }`}>
                    <div className="flex items-start gap-2">
                      <i className={`mt-0.5 ${
                        notification.type === 'success' ? 'ri-checkbox-circle-fill text-emerald-400' :
                        notification.type === 'error' ? 'ri-error-warning-fill text-rose-400' :
                        'ri-information-fill text-blue-400'
                      }`}></i>
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Forms and Lists */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Send Child Request Form - Animated */}
            <div className='relative group animate-slideInUp' style={{ animationDelay: '300ms' }}>
              <div className='absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
              <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                <h2 className='text-xl font-semibold mb-4 text-white flex items-center gap-2'>
                  <div className='relative w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg animate-wave'>
                    <i className="ri-user-add-line text-white"></i>
                  </div>
                  Send Child Request
                </h2>
                <form 
                onSubmit={sendChildRequest} 
                className="flex gap-4">
                  <div className='relative flex-1 group/input'>
                    <div className='absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover/input:opacity-100 transition-opacity duration-500'></div>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter user's email address"
                      className="relative w-full bg-gray-900/50 backdrop-blur-sm border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 focus:bg-gray-900/70 transition-all duration-300"
                      required
                      disabled={isSendingRequest}
                    />
                    <i className="ri-mail-line absolute right-4 top-1/2 -translate-y-1/2 text-white/40"></i>
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingRequest}
                    className="relative px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-2xl hover:shadow-pink-500/25 flex items-center gap-2 group/btn hover:scale-105 active:scale-95"
                  >
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000'></div>
                    {isSendingRequest ? (
                      <>
                        <div className='relative w-5 h-5'>
                          <div className='absolute inset-0 border-2 border-white/20 rounded-full'></div>
                          <div className='absolute inset-0 border-2 border-t-white rounded-full animate-spin'></div>
                        </div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-fill group-hover/btn:translate-x-1 transition-transform"></i>
                        Send Request
                        <i className="ri-arrow-right-line ml-1 group-hover/btn:translate-x-1 transition-transform"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Pending Requests - Animated List */}
            {pendingRequests.length > 0 && (
              <div className='relative group animate-slideInUp' style={{ animationDelay: '400ms' }}>
                <div className='absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
                <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
                      <div className='relative w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse'>
                        <i className="ri-time-line text-white"></i>
                      </div>
                      Pending Requests ({pendingRequests.length})
                    </h2>
                    <button
                      onClick={loadParentData}
                      className="text-sm text-white/60 hover:text-white flex items-center gap-1 hover:scale-105 transition-all"
                      title="Refresh pending requests"
                    >
                      <i className="ri-refresh-line"></i>
                      Refresh
                    </button>
                  </div>
                  <div className='space-y-3'>
                    {pendingRequests.map(request => (
                      <div key={request._id} className="group/item relative p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{request.userName}</p>
                            <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                              <i className="ri-time-line text-amber-400"></i>
                              Requested: {new Date(request.requestedAt).toLocaleDateString()} at {new Date(request.requestedAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            
                            <button
                              onClick={() => cancelRequest(request._id)}
                              className="relative px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg hover:from-rose-700 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-rose-500/25 hover:scale-105 active:scale-95"
                            >
                              <i className="ri-close-line"></i>
                              Withdraw
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Children List - Animated Cards */}
            <div className='relative group animate-slideInUp' style={{ animationDelay: '500ms' }}>
              <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
              <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                <div className="flex justify-between items-center mb-4">
                  <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
                    <div className='relative w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg'>
                      <i className="ri-user-line text-white"></i>
                    </div>
                    My Children ({children.length})
                  </h2>
                  {children.length > 0 && (
                    <span className="text-sm text-white/60">
                      {selectedChild ? `Tracking: ${selectedChild.fullname?.firstname}` : 'Select a child to track'}
                    </span>
                  )}
                </div>
                {children.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="ri-user-search-line text-5xl text-white/20 mb-4"></i>
                    <p className="text-white/50 text-lg font-medium">No children added yet</p>
                    <p className="text-white/30 text-sm mt-1">Send requests to users to add them as your children</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {children.map((child, index) => {
                      const stats = childStats[child._id] || {};
                      return (
                        <div
                          key={child._id}
                          className={`group/item relative p-4 rounded-xl border transition-all duration-500 hover:scale-[1.02] ${
                            selectedChild?._id === child._id 
                              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 shadow-2xl shadow-pink-500/20' 
                              : 'bg-gradient-to-r from-white/5 to-transparent border-white/10 hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/10'
                          }`}
                          style={{ animation: `slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`, animationDelay: `${index * 100}ms` }}
                        >
                          {/* Hover glow effect */}
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
                            selectedChild?._id === child._id 
                              ? 'from-pink-500/30 to-purple-500/30' 
                              : 'from-pink-500/10 to-purple-500/10'
                          } opacity-0 group-hover/item:opacity-100 transition-opacity duration-300`}></div>
                          
                          <div className="relative flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-2xl transition-all duration-500 group-hover/item:scale-110 ${
                                selectedChild?._id === child._id 
                                  ? 'bg-gradient-to-br from-pink-500 to-purple-500 animate-pulse' 
                                  : 'bg-gradient-to-br from-gray-600 to-gray-700'
                              }`}>
                                {selectedChild?._id === child._id && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                )}
                                {child.fullname?.firstname?.charAt(0)}{child.fullname?.lastname?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  {child.fullname?.firstname} {child.fullname?.lastname}
                                </p>
                                <p className="text-sm text-white/60">{child.email}</p>
                                {selectedChild?._id === child._id && currentRide && (
                                  <p className="text-sm text-cyan-400 font-semibold flex items-center gap-1 mt-1">
                                    <i className="ri-roadster-line"></i>
                                    Active Ride: <span className="capitalize">{currentRide.status}</span>
                                    {captainLocation && (
                                      <span className="flex items-center gap-1 ml-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Live tracking active
                                      </span>
                                    )}
                                  </p>
                                )}
                                {stats.totalRides > 0 && (
                                  <div className="flex gap-4 mt-2">
                                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/80">
                                      {stats.totalRides} rides
                                    </span>
                                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/80">
                                      ₹{stats.totalSpent || 0} spent
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => trackChildLocation(child._id)}
                                className={`relative px-4 py-2 rounded-lg transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 ${
                                  selectedChild?._id === child._id 
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-emerald-500/25' 
                                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/25'
                                }`}
                              >
                                <i className={`ri-map-pin-line ${selectedChild?._id === child._id ? 'animate-bounce' : ''}`}></i>
                                {selectedChild?._id === child._id ? 'Tracking' : 'Track'}
                              </button>
                              <button
                                onClick={() => setShowChildDetails(child._id === showChildDetails ? null : child._id)}
                                className="relative px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                              >
                                <i className="ri-information-line"></i>
                                Details
                              </button>
                              <button
                                onClick={() => removeChild(child._id)}
                                className="relative px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg hover:from-rose-700 hover:to-red-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                              >
                                <i className="ri-user-unfollow-line"></i>
                                Remove
                              </button>
                            </div>
                          </div>
                          
                          {/* Child Details Expanded View */}
                          {showChildDetails === child._id && (
                            <div className="mt-4 pt-4 border-t border-white/10 animate-slideInUp">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-white/80 mb-2">Ride Statistics</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-white/60">Total Rides</span>
                                      <span className="font-semibold text-pink-400">{stats.totalRides || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-white/60">This Month</span>
                                      <span className="font-semibold text-purple-400">{stats.ridesThisMonth || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-white/60">Total Spent</span>
                                      <span className="font-semibold text-emerald-400">₹{stats.totalSpent || 0}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white/80 mb-2">Actions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => {
                                        loadRideHistory(child._id);
                                        setShowRideHistory(true);
                                      }}
                                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors hover:scale-105"
                                    >
                                      Ride History
                                    </button>
                                    <button
                                      onClick={() => sendMessageToCaptain()}
                                      disabled={!currentRide?.captain}
                                      className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Message Captain
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map and Details */}
          <div className='space-y-6'>
            {/* Map for Tracking - Animated */}
            {selectedChild ? (
              <div className='relative group animate-slideInUp' style={{ animationDelay: '600ms' }}>
                <div className='absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
                <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                  <h2 className='text-xl font-semibold mb-4 text-white flex items-center gap-2'>
                    <div className='relative w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg animate-wave'>
                      <i className="ri-map-pin-line text-white"></i>
                    </div>
                    Tracking: <span className='text-pink-300'>{selectedChild.fullname?.firstname}</span>
                  </h2>
                  
                  {currentRide ? (
                    <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30 shadow-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                          <i className="ri-roadster-fill text-cyan-400 animate-pulse"></i>
                          Active Ride Details
                        </h3>
                        <button
                          onClick={sendMessageToCaptain}
                          className="relative px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-sm flex items-center gap-1 hover:scale-105"
                        >
                          <i className="ri-message-2-line"></i>
                          Message Captain
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Status:</span>
                          <span className="font-medium capitalize text-cyan-400">{currentRide.status}</span>
                        </div>
                        {currentRide.captain && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Captain:</span>
                            <span className="font-medium text-white">
                              {currentRide.captain.fullname?.firstname} {currentRide.captain.fullname?.lastname}
                            </span>
                          </div>
                        )}
                        {currentRide.pickup && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">From:</span>
                            <span className="font-medium text-white/90 text-right">{currentRide.pickup.address}</span>
                          </div>
                        )}
                        {currentRide.destination && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">To:</span>
                            <span className="font-medium text-white/90 text-right">{currentRide.destination.address}</span>
                          </div>
                        )}
                        {currentRide.fare && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Fare:</span>
                            <span className="font-medium text-emerald-400">₹{currentRide.fare}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10">
                      <p className="text-white/60 flex items-center gap-2">
                        <i className="ri-information-line text-cyan-400"></i>
                        No active ride - {selectedChild.fullname?.firstname} is not currently on a trip
                      </p>
                    </div>
                  )}

                  <div className="h-96 rounded-xl overflow-hidden border border-white/20 shadow-2xl relative group/map">
                    {/* Pulsing effect for map */}
                    {pulseAnimation && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-pulse z-10"></div>
                    )}
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: '100%', width: '100%', backgroundColor: '#1a1a2e' }}
                      whenCreated={map => mapRef.current = map}
                    >
                      <MapUpdater center={mapCenter} zoom={13} />
                      {/* Dark theme tile layer */}
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      
                      {/* Child Location Marker with animation */}
                      {childLocation && (
                        <Marker 
                          position={[childLocation.coordinates[1], childLocation.coordinates[0]]}
                          icon={childIcon}
                        >
                          <Popup className="dark-popup">
                            <div className="text-center p-2 bg-gray-900 text-white rounded-lg">
                              <strong className="text-emerald-400">👤 Child Location</strong><br />
                              {selectedChild.fullname?.firstname} {selectedChild.fullname?.lastname}<br />
                              <em className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</em>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {/* Captain Location Marker with animation */}
                      {captainLocation && (
                        <Marker 
                          position={[captainLocation.coordinates[1], captainLocation.coordinates[0]]}
                          icon={captainIcon}
                        >
                          <Popup className="dark-popup">
                            <div className="text-center p-2 bg-gray-900 text-white rounded-lg">
                              <strong className="text-cyan-400">🚗 Captain</strong><br />
                              {currentRide?.captain?.fullname?.firstname} {currentRide?.captain?.fullname?.lastname}<br />
                              <em className="text-sm text-gray-400">Live tracking active</em>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {/* Pickup and Destination Markers */}
                      {currentRide && (
                        <>
                          {currentRide.pickup && currentRide.pickup.location && (
                            <Marker 
                              position={[currentRide.pickup.location.coordinates[1], currentRide.pickup.location.coordinates[0]]}
                              icon={pickupIcon}
                            >
                              <Popup className="dark-popup">
                                <div className="text-center p-2 bg-gray-900 text-white rounded-lg">
                                  <strong className="text-amber-400">📍 Pickup Location</strong><br />
                                  {currentRide.pickup.address}
                                </div>
                              </Popup>
                            </Marker>
                          )}
                          {currentRide.destination && currentRide.destination.location && (
                            <Marker 
                              position={[currentRide.destination.location.coordinates[1], currentRide.destination.location.coordinates[0]]}
                              icon={destinationIcon}
                            >
                              <Popup className="dark-popup">
                                <div className="text-center p-2 bg-gray-900 text-white rounded-lg">
                                  <strong className="text-rose-400">🎯 Destination</strong><br />
                                  {currentRide.destination.address}
                                </div>
                              </Popup>
                            </Marker>
                          )}
                        </>
                      )}

                      {/* Route Polyline */}
                      {currentRide && captainLocation && getRoutePolyline().length > 0 && (
                        <Polyline
                          positions={getRoutePolyline()}
                          color="#ec4899"
                          weight={4}
                          opacity={0.8}
                          dashArray="10, 10"
                        />
                      )}
                    </MapContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className='relative group animate-slideInUp' style={{ animationDelay: '600ms' }}>
                <div className='absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
                <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center'>
                  <i className="ri-map-pin-line text-5xl text-white/20 mb-4"></i>
                  <h3 className="text-lg font-semibold text-white/70 mb-2">No Child Selected</h3>
                  <p className="text-white/50">Select a child from the list to start tracking</p>
                </div>
              </div>
            )}

            {/* Quick Stats - Animated */}
            <div className='relative group animate-slideInUp' style={{ animationDelay: '700ms' }}>
              <div className='absolute -inset-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500'></div>
              <div className='relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <div className='relative w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-lg'>
                    <i className="ri-bar-chart-line text-white"></i>
                  </div>
                  Quick Stats
                </h3>
                {selectedChild ? (
                  <div className="space-y-4">
                    {childStats[selectedChild._id] ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Total Rides</span>
                          <span className="font-bold text-cyan-400 text-lg">{childStats[selectedChild._id].totalRides || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">This Month</span>
                          <span className="font-bold text-emerald-400 text-lg">{childStats[selectedChild._id].ridesThisMonth || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Total Spent</span>
                          <span className="font-bold text-purple-400 text-lg">₹{childStats[selectedChild._id].totalSpent || 0}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-white/50 text-sm">No statistics available yet</p>
                    )}
                    <button
                      onClick={() => {
                        loadRideHistory(selectedChild._id);
                        setShowRideHistory(true);
                      }}
                      className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white rounded-lg hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300 font-semibold hover:scale-105 active:scale-95 border border-pink-500/30 hover:border-pink-500/50"
                    >
                      View Ride History
                    </button>
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">Select a child to view statistics</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components with enhanced animations */}
      {showRideHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl transform animate-scaleIn">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Ride History for <span className="text-pink-300">{selectedChild?.fullname?.firstname}</span></h3>
                <button
                  onClick={() => setShowRideHistory(false)}
                  className="text-white/60 hover:text-white transition-colors hover:scale-110"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {rideHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="ri-history-line text-5xl text-white/20 mb-4"></i>
                  <p className="text-white/50">No ride history available</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {rideHistory.map((ride, index) => (
                    <div key={ride._id} className="p-6 hover:bg-white/5 transition-all duration-300 group" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white group-hover:text-pink-300 transition-colors">
                            {ride.pickup?.address} → {ride.destination?.address}
                          </p>
                          <div className="flex gap-4 mt-2 flex-wrap">
                            <span className="text-sm text-white/60">
                              {new Date(ride.createdAt).toLocaleDateString()} at {new Date(ride.createdAt).toLocaleTimeString()}
                            </span>
                            <span className="text-sm font-semibold text-emerald-400">₹{ride.fare}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ride.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {ride.status}
                            </span>
                          </div>
                          {ride.captain && (
                            <p className="text-sm text-white/60 mt-2">
                              Captain: {ride.captain.fullname?.firstname} {ride.captain.fullname?.lastname}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1a1a2e;
          color: white;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .dark-popup .leaflet-popup-tip {
          background: #1a1a2e;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ParentHome;