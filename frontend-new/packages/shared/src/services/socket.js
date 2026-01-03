import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
    this.connectionCallbacks = {
      onConnect: [],
      onDisconnect: [],
      onError: [],
    };
  }

  // Initialize socket connection
  initialize(token = null) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    console.log('🔌 Connecting to WebSocket:', backendUrl);

    // Socket connection options
    const options = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true,
      query: {},
    };

    // Add auth token if provided
    if (token) {
      options.query.token = token;
    } else {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        options.query.token = storedToken;
      }
    }

    this.socket = io(backendUrl, options);

    this.setupEventListeners();
    return this.socket;
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionCallbacks.onConnect.forEach(callback => callback());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.connectionCallbacks.onDisconnect.forEach(callback => callback(reason));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connectionCallbacks.onError.forEach(callback => callback(error));
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔁 Reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnect attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts');
    });

    // Listen for custom events that were registered before connection
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
    });
  }

  // Emit an event
  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Event not sent:', event);
      return false;
    }

    console.log(`📤 Emitting event: ${event}`, data);
    this.socket.emit(event, data);
    return true;
  }

  // Listen for an event
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventListeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (this.socket && callbacks.size === 0) {
          this.socket.off(event, callback);
        }
      }
    };
  }

  // Remove event listener
  off(event, callback) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    }
  }

  // Register connection callbacks
  onConnect(callback) {
    this.connectionCallbacks.onConnect.push(callback);
  }

  onDisconnect(callback) {
    this.connectionCallbacks.onDisconnect.push(callback);
  }

  onError(callback) {
    this.connectionCallbacks.onError.push(callback);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }

  // Check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Common socket events for the application
  static Events = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    
    // Ride events
    RIDE_REQUEST: 'ride_request',
    RIDE_ACCEPTED: 'ride_accepted',
    RIDE_STARTED: 'ride_started',
    RIDE_COMPLETED: 'ride_completed',
    RIDE_CANCELLED: 'ride_cancelled',
    RIDE_UPDATE: 'ride_update',
    
    // Location events
    LOCATION_UPDATE: 'location_update',
    TRACK_LOCATION: 'track_location',
    
    // Captain events
    CAPTAIN_AVAILABLE: 'captain_available',
    CAPTAIN_UNAVAILABLE: 'captain_unavailable',
    CAPTAIN_LOCATION: 'captain_location',
    
    // User events
    USER_LOCATION: 'user_location',
    USER_ARRIVED: 'user_arrived',
    
    // Parent events
    CHILD_LOCATION: 'child_location',
    GEO_FENCE_ALERT: 'geo_fence_alert',
    
    // Emergency events
    SOS_TRIGGERED: 'sos_triggered',
    SOS_RESOLVED: 'sos_resolved',
    
    // Chat events
    CHAT_MESSAGE: 'chat_message',
    TYPING: 'typing',
  };

  // Helper methods for common operations
  requestRide(rideData) {
    return this.emit(SocketService.Events.RIDE_REQUEST, rideData);
  }

  updateLocation(location) {
    return this.emit(SocketService.Events.LOCATION_UPDATE, location);
  }

  sendChatMessage(message) {
    return this.emit(SocketService.Events.CHAT_MESSAGE, message);
  }

  triggerSOS(sosData) {
    return this.emit(SocketService.Events.SOS_TRIGGERED, sosData);
  }
}

// Create singleton instance
export const socketService = new SocketService();