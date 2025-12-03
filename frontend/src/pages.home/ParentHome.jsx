import React, { useState, useEffect, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// Custom icons
const childIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const captainIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const destinationIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
  const [children, setChildren] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [childLocation, setChildLocation] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to Delhi
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const { socket } = useContext(SocketContext);
  const { parent } = useContext(ParentDataContext);

  // Enhanced socket implementation
  useEffect(() => {
    if (!parent || !socket) return;

    // Join parent room
    socket.emit('parent-join', parent._id);

    // Listen for real-time events
    const handleChildLocationUpdate = (data) => {
      console.log('Child location updated:', data);
      if (selectedChild && data.userId === selectedChild._id) {
        setChildLocation(data.location);
        setMapCenter([data.location.coordinates[1], data.location.coordinates[0]]);
        addNotification(`${data.userName}'s location updated`, 'info');
      }
    };

    const handleCaptainLocationUpdate = (data) => {
      console.log('Captain location updated:', data);
      if (selectedChild && data.childId === selectedChild._id) {
        setCaptainLocation(data.location);
      }
    };

    const handleChildRideStarted = (data) => {
      console.log('Child ride started:', data);
      if (data.childId === selectedChild?._id) {
        setCurrentRide(data.ride);
        addNotification(`Ride started for ${data.childName}`, 'success');
      }
    };

    const handleChildRideOngoing = (data) => {
      console.log('Child ride ongoing:', data);
      if (data.childId === selectedChild?._id) {
        addNotification(`Ride ongoing for ${data.childName} with captain ${data.captain.name}`, 'info');
      }
    };

    const handleChildRideEnded = (data) => {
      console.log('Child ride ended:', data);
      if (data.childId === selectedChild?._id) {
        setCurrentRide(null);
        setCaptainLocation(null);
        addNotification(`Ride completed for ${data.childName}. Fare: ₹${data.fare}`, 'success');
      }
    };

    const handleRideAcceptedNotification = (notification) => {
      console.log('Ride accepted notification:', notification);
      addNotification(notification.message, 'success');
    };

    const handleParentRequestAccepted = (data) => {
      console.log('Parent request accepted:', data);
      addNotification(`${data.userName} accepted your parent request!`, 'success');
      
      // Reload parent data to update children list
      loadParentData();
    };

    const handleParentRequestRejected = (data) => {
      console.log('Parent request rejected:', data);
      addNotification(`${data.userName} rejected your parent request.`, 'error');
    };

    const handleSocketError = (error) => {
      console.error('Socket error:', error);
      addNotification('Connection error. Please check your internet.', 'error');
    };

    // Register event listeners
    socket.on('child-location-updated', handleChildLocationUpdate);
    socket.on('captain-location-update', handleCaptainLocationUpdate);
    socket.on('child-ride-started', handleChildRideStarted);
    socket.on('child-ride-ongoing', handleChildRideOngoing);
    socket.on('child-ride-ended', handleChildRideEnded);
    socket.on('ride-accepted-notification', handleRideAcceptedNotification);
    socket.on('parent-request-accepted-notification', handleParentRequestAccepted);
    socket.on('parent-request-rejected-notification', handleParentRequestRejected);
    socket.on('error', handleSocketError);
    socket.on('connect_error', handleSocketError);

    loadParentData();

    return () => {
      // Cleanup event listeners
      socket.off('child-location-updated', handleChildLocationUpdate);
      socket.off('captain-location-update', handleCaptainLocationUpdate);
      socket.off('child-ride-started', handleChildRideStarted);
      socket.off('child-ride-ongoing', handleChildRideOngoing);
      socket.off('child-ride-ended', handleChildRideEnded);
      socket.off('ride-accepted-notification', handleRideAcceptedNotification);
      socket.off('parent-request-accepted-notification', handleParentRequestAccepted);
      socket.off('parent-request-rejected-notification', handleParentRequestRejected);
      socket.off('error', handleSocketError);
      socket.off('connect_error', handleSocketError);
    };
  }, [parent, socket, selectedChild]);

  // Notification system
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const loadParentData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/parents/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      setChildren(response.data.parent.children || []);
      
      // Load pending requests
      const requestsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/parents/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setPendingRequests(requestsResponse.data.requests || []);
    } catch (error) {
      console.error('Error loading parent data:', error);
      addNotification('Error loading parent data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChildRequest = async (e) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      addNotification('Please enter a valid email', 'error');
      return;
    }

    try {
      setIsSendingRequest(true);
      const token = localStorage.getItem('token');
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
      
      addNotification('Request sent successfully!', 'success');
      setUserEmail('');
      loadParentData();

      // Notify user via socket
      if (socket && parent) {
        socket.emit('parent-request-sent', {
          userEmail: userEmail,
          parentId: parent._id
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/parents/cancel-request/${requestId}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      addNotification('Request cancelled successfully', 'info');
      loadParentData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error cancelling request';
      addNotification(errorMessage, 'error');
    }
  };

  const removeChild = async (childId) => {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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

  // Notification Toast Component
  const NotificationToast = () => (
    <div className="fixed top-20 right-5 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-700'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-blue-50 border-blue-500 text-blue-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <i className={`mt-1 ${
                notification.type === 'success' ? 'ri-checkbox-circle-fill text-green-500' :
                notification.type === 'error' ? 'ri-error-warning-fill text-red-500' :
                'ri-information-fill text-blue-500'
              }`}></i>
              <div>
                <p className="font-medium text-sm">{notification.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-600 font-semibold'>Loading parent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
      <NotificationToast />
      
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Parent Dashboard</h1>
            <p className='text-gray-600 mt-2'>
              Welcome back, {parent?.fullname?.firstname} {parent?.fullname?.lastname}
            </p>
          </div>
          <Link 
            to='/parent/logout' 
            className='h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/50 text-white'
          >
            <i className="text-lg ri-logout-box-r-line"></i>
          </Link>
        </div>
        
        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={clearNotifications}
                className="text-gray-500 hover:text-gray-700 text-sm font-semibold flex items-center gap-1"
              >
                <i className="ri-close-line"></i>
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 3).map(notification => (
                <div key={notification.id} className={`text-sm p-3 rounded-lg border-l-4 ${
                  notification.type === 'success' 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : notification.type === 'error'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-blue-50 border-blue-500 text-blue-700'
                }`}>
                  <div className="flex items-start gap-2">
                    <i className={`mt-0.5 ${
                      notification.type === 'success' ? 'ri-checkbox-circle-fill' :
                      notification.type === 'error' ? 'ri-error-warning-fill' :
                      'ri-information-fill'
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
        )}

        {/* Send Child Request Form */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Send Child Request</h2>
          <form onSubmit={sendChildRequest} className="flex gap-4">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter user's email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
              disabled={isSendingRequest}
            />
            <button
              type="submit"
              disabled={isSendingRequest}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
              {isSendingRequest ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Sending...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-fill"></i>
                  Send Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800'>Pending Requests ({pendingRequests.length})</h2>
            <div className='space-y-3'>
              {pendingRequests.map(request => (
                <div key={request._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{request.userName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <i className="ri-time-line"></i>
                      Requested: {new Date(request.requestedAt).toLocaleDateString()} at {new Date(request.requestedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptChildRequest(request._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 shadow-lg hover:shadow-green-500/25"
                    >
                      <i className="ri-check-line"></i>
                      Accept
                    </button>
                    <button
                      onClick={() => cancelRequest(request._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 shadow-lg hover:shadow-red-500/25"
                    >
                      <i className="ri-close-line"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children List */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className="flex justify-between items-center mb-4">
            <h2 className='text-xl font-semibold text-gray-800'>My Children ({children.length})</h2>
            {children.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedChild ? `Tracking: ${selectedChild.fullname?.firstname}` : 'Select a child to track'}
              </span>
            )}
          </div>
          {children.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-user-search-line text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg font-medium">No children added yet</p>
              <p className="text-gray-400 text-sm mt-1">Send requests to users to add them as your children</p>
            </div>
          ) : (
            <div className="space-y-4">
              {children.map(child => (
                <div key={child._id} className={`p-4 border rounded-xl transition-all duration-300 ${
                  selectedChild?._id === child._id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        selectedChild?._id === child._id 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        {child.fullname?.firstname?.charAt(0)}{child.fullname?.lastname?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {child.fullname?.firstname} {child.fullname?.lastname}
                        </p>
                        <p className="text-sm text-gray-600">{child.email}</p>
                        {selectedChild?._id === child._id && currentRide && (
                          <p className="text-sm text-blue-600 font-semibold flex items-center gap-1 mt-1">
                            <i className="ri-roadster-line"></i>
                            Active Ride: <span className="capitalize">{currentRide.status}</span>
                            {captainLocation && (
                              <span className="flex items-center gap-1 ml-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Live tracking active
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => trackChildLocation(child._id)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 font-semibold flex items-center gap-2 ${
                          selectedChild?._id === child._id 
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25'
                        }`}
                      >
                        <i className="ri-map-pin-line"></i>
                        {selectedChild?._id === child._id ? 'Tracking' : 'Track Location'}
                      </button>
                      <button
                        onClick={() => removeChild(child._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 shadow-lg hover:shadow-red-500/25"
                      >
                        <i className="ri-user-unfollow-line"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map for Tracking */}
        {selectedChild && (
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800'>
              <i className="ri-map-pin-line mr-2 text-blue-600"></i>
              Tracking: {selectedChild.fullname?.firstname} {selectedChild.fullname?.lastname}
            </h2>
            
            {currentRide ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 text-lg mb-3 flex items-center gap-2">
                  <i className="ri-roadster-fill"></i>
                  Active Ride Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize text-blue-700">{currentRide.status}</p>
                  </div>
                  {currentRide.captain && (
                    <div>
                      <p className="text-sm text-gray-600">Captain</p>
                      <p className="font-medium">
                        {currentRide.captain.fullname?.firstname} {currentRide.captain.fullname?.lastname}
                      </p>
                    </div>
                  )}
                  {currentRide.pickup && (
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-medium">{currentRide.pickup.address}</p>
                    </div>
                  )}
                  {currentRide.destination && (
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-medium">{currentRide.destination.address}</p>
                    </div>
                  )}
                  {captainLocation && (
                    <div className="md:col-span-2">
                      <p className="text-green-600 font-medium flex items-center gap-2">
                        <i className="ri-checkbox-circle-fill"></i>
                        Live captain tracking active
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-600 flex items-center gap-2">
                  <i className="ri-information-line"></i>
                  No active ride - {selectedChild.fullname?.firstname} is not currently on a trip
                </p>
              </div>
            )}

            <div className="h-96 rounded-xl overflow-hidden border border-gray-300 shadow-lg">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <MapUpdater center={mapCenter} zoom={13} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Child Location Marker */}
                {childLocation && (
                  <Marker 
                    position={[childLocation.coordinates[1], childLocation.coordinates[0]]}
                    icon={childIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>👤 Child Location</strong><br />
                        {selectedChild.fullname?.firstname} {selectedChild.fullname?.lastname}<br />
                        <em>Last updated: {new Date().toLocaleTimeString()}</em>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Captain Location Marker */}
                {captainLocation && (
                  <Marker 
                    position={[captainLocation.coordinates[1], captainLocation.coordinates[0]]}
                    icon={captainIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>🚗 Captain</strong><br />
                        {currentRide?.captain?.fullname?.firstname} {currentRide?.captain?.fullname?.lastname}<br />
                        Vehicle: {currentRide?.captain?.vehicle?.vehicleType}<br />
                        <em>Live tracking active</em>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route Polyline */}
                {currentRide && captainLocation && getRoutePolyline().length > 0 && (
                  <Polyline
                    positions={getRoutePolyline()}
                    color="blue"
                    weight={6}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                )}

                {/* Pickup and Destination Markers */}
                {currentRide && (
                  <>
                    {currentRide.pickup && currentRide.pickup.location && (
                      <Marker 
                        position={[currentRide.pickup.location.coordinates[1], currentRide.pickup.location.coordinates[0]]}
                        icon={pickupIcon}
                      >
                        <Popup>
                          <strong>📍 Pickup Location</strong><br />
                          {currentRide.pickup.address}
                        </Popup>
                      </Marker>
                    )}
                    {currentRide.destination && currentRide.destination.location && (
                      <Marker 
                        position={[currentRide.destination.location.coordinates[1], currentRide.destination.location.coordinates[0]]}
                        icon={destinationIcon}
                      >
                        <Popup>
                          <strong>🎯 Destination</strong><br />
                          {currentRide.destination.address}
                        </Popup>
                      </Marker>
                    )}
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentHome;