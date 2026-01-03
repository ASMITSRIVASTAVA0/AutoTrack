import axios from 'axios';

// Create axios instance with base configuration
const createApiService = () => {
  // Get base URL from environment variable
  const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  const api = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error.message);
    }
  );

  // Common API methods
  const apiService = {
    // User methods
    user: {
      login: (data) => api.post('/api/user/login', data),
      signup: (data) => api.post('/api/user/signup', data),
      getProfile: () => api.get('/api/user/profile'),
      updateProfile: (data) => api.put('/api/user/profile', data),
      getRideHistory: () => api.get('/api/user/rides'),
      requestRide: (data) => api.post('/api/user/request-ride', data),
    },

    // Captain methods
    captain: {
      login: (data) => api.post('/api/captain/login', data),
      signup: (data) => api.post('/api/captain/signup', data),
      updateLocation: (data) => api.post('/api/captain/location', data),
      getActiveRides: () => api.get('/api/captain/active-rides'),
      acceptRide: (rideId) => api.post(`/api/captain/ride/${rideId}/accept`),
      completeRide: (rideId) => api.post(`/api/captain/ride/${rideId}/complete`),
    },

    // Parent methods
    parent: {
      login: (data) => api.post('/api/parent/login', data),
      signup: (data) => api.post('/api/parent/signup', data),
      addChild: (data) => api.post('/api/parent/children', data),
      getChildren: () => api.get('/api/parent/children'),
      trackChild: (childId) => api.get(`/api/parent/children/${childId}/location`),
      setGeofence: (data) => api.post('/api/parent/geofence', data),
    },

    // Ride methods
    rides: {
      getActiveRide: () => api.get('/api/rides/active'),
      cancelRide: (rideId) => api.delete(`/api/rides/${rideId}`),
      getRideDetails: (rideId) => api.get(`/api/rides/${rideId}`),
      rateRide: (rideId, data) => api.post(`/api/rides/${rideId}/rate`, data),
    },

    // Utility methods
    setAuthToken: (token) => {
      localStorage.setItem('token', token);
    },
    
    clearAuthToken: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    getAuthToken: () => {
      return localStorage.getItem('token');
    },
    
    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    },
  };

  return apiService;
};

export const apiService = createApiService();