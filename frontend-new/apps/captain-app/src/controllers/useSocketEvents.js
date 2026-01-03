import { useEffect, useRef } from 'react';

const useSocketEvents = ({
  socket,
  captain,
  setRide,
  setRidePopupPanel,
  addNotification
}) => {
  const isInitialized = useRef(false);
  const eventHandlers = useRef({});

  useEffect(() => {
    if (!socket || !captain?._id || isInitialized.current) return;

    console.log('Setting up socket events for captain:', captain._id);
    isInitialized.current = true;

    // Clean up any existing listeners
    if (eventHandlers.current.connect) {
      socket.off('connect', eventHandlers.current.connect);
    }
    if (eventHandlers.current.newRide) {
      socket.off('new-ride', eventHandlers.current.newRide);
    }

    // Define event handlers
    eventHandlers.current.handleConnect = () => {
      console.log('Socket connected, joining captain room');
      socket.emit('join', {
        userId: captain._id,
        userType: 'captain'
      });
    };

    eventHandlers.current.handleNewRide = (data) => {
      console.log('New ride received:', data);
      setRide(data);
      setRidePopupPanel(true);
      addNotification('🚗 New ride request received!', 'success', true);
    };

    // Set up listeners
    socket.on('connect', eventHandlers.current.handleConnect);
    socket.on('new-ride', eventHandlers.current.handleNewRide);

    // Join immediately if already connected
    if (socket.connected) {
      console.log('Socket already connected, joining immediately');
      socket.emit('join', {
        userId: captain._id,
        userType: 'captain'
      });
    }

    // Store handlers for cleanup
    eventHandlers.current.connect = eventHandlers.current.handleConnect;
    eventHandlers.current.newRide = eventHandlers.current.handleNewRide;

    // Cleanup function
    return () => {
      console.log('Cleaning up socket event listeners');
      if (socket) {
        if (eventHandlers.current.connect) {
          socket.off('connect', eventHandlers.current.connect);
        }
        if (eventHandlers.current.newRide) {
          socket.off('new-ride', eventHandlers.current.newRide);
        }
      }
      isInitialized.current = false;
      eventHandlers.current = {};
    };
  }, [socket, captain?._id]); // Only depend on socket and captain._id
};

export default useSocketEvents;