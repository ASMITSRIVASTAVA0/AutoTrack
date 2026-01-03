// Cross-app messaging service for communication between different app instances
class CrossAppMessaging {
  constructor() {
    this.listeners = new Map();
    this.appId = this.generateAppId();
    this.appType = this.detectAppType();
    
    // Set up message listener
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    window.addEventListener('message', this.handleMessageEvent.bind(this));
  }

  generateAppId() {
    // Generate unique ID for this app instance
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  detectAppType() {
    // Detect which app this is based on URL
    const url = window.location.href;
    if (url.includes('localhost:3001')) return 'captain';
    if (url.includes('localhost:3002')) return 'parent';
    if (url.includes('localhost:3003')) return 'user';
    return 'unknown';
  }

  // Send message to other apps
  sendMessage(eventType, data, targetApps = ['captain', 'parent', 'user']) {
    const message = {
      eventType,
      data,
      source: this.appType,
      sourceId: this.appId,
      timestamp: Date.now(),
      targetApps,
    };

    // Method 1: localStorage (for same-origin apps)
    try {
      localStorage.setItem('cross_app_msg', JSON.stringify(message));
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cross_app_msg',
        newValue: JSON.stringify(message),
      }));
    } catch (e) {
      console.warn('localStorage not available for messaging:', e);
    }

    // Method 2: BroadcastChannel (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('autotrack_apps');
        channel.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel not available:', e);
      }
    }

    // Method 3: window.postMessage (for cross-window communication)
    if (window.opener) {
      window.opener.postMessage(message, '*');
    }

    // Notify local listeners
    this.notifyLocalListeners(eventType, data);
  }

  // Listen for messages
  onMessage(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Handle storage events
  handleStorageEvent(event) {
    if (event.key === 'cross_app_msg' && event.newValue) {
      try {
        const message = JSON.parse(event.newValue);
        this.processIncomingMessage(message);
      } catch (e) {
        console.error('Error parsing cross-app message:', e);
      }
    }
  }

  // Handle message events
  handleMessageEvent(event) {
    if (event.data && event.data.source && event.data.eventType) {
      this.processIncomingMessage(event.data);
    }
  }

  // Process incoming message
  processIncomingMessage(message) {
    // Check if this message is for our app type
    if (message.targetApps && !message.targetApps.includes(this.appType)) {
      return;
    }

    // Don't process our own messages
    if (message.sourceId === this.appId) {
      return;
    }

    // Notify listeners
    this.notifyLocalListeners(message.eventType, message.data);
  }

  // Notify local listeners
  notifyLocalListeners(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error('Error in message callback:', e);
        }
      });
    }
  }

  // Common message types
  static Events = {
    // Ride events
    RIDE_REQUESTED: 'ride_requested',
    RIDE_ACCEPTED: 'ride_accepted',
    RIDE_STARTED: 'ride_started',
    RIDE_COMPLETED: 'ride_completed',
    RIDE_CANCELLED: 'ride_cancelled',
    
    // Location events
    LOCATION_UPDATED: 'location_updated',
    CAPTAIN_NEARBY: 'captain_nearby',
    
    // Safety events
    SOS_TRIGGERED: 'sos_triggered',
    GEO_FENCE_BREACH: 'geo_fence_breach',
    
    // App coordination
    APP_OPENED: 'app_opened',
    APP_CLOSED: 'app_closed',
  };

  // Helper methods for common scenarios
  notifyRideRequest(rideData) {
    this.sendMessage(CrossAppMessaging.Events.RIDE_REQUESTED, rideData, ['captain']);
  }

  notifyRideAccepted(rideData) {
    this.sendMessage(CrossAppMessaging.Events.RIDE_ACCEPTED, rideData, ['user', 'parent']);
  }

  notifyLocationUpdate(location) {
    this.sendMessage(CrossAppMessaging.Events.LOCATION_UPDATED, location, ['parent']);
  }

  notifySOS(sosData) {
    this.sendMessage(CrossAppMessaging.Events.SOS_TRIGGERED, sosData, ['parent', 'captain']);
  }
}

// Create singleton instance
export const crossAppMessaging = new CrossAppMessaging();