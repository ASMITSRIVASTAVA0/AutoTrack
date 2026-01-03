// Export all shared components
// export { default as SocketContext } from './contexts/SocketContext.jsx';
// export { default as Start } from './components/Start.jsx';
// export { default as Role } from './components/Role.jsx';
// export { default as LoadingFallback } from './optimization/LoadingFallback.jsx';
// export { default as RoutePreloader } from './optimization/RoutePreloader.jsx';

// Export cross-app messaging
export { crossAppMessaging } from './services/crossAppMessaging.js';
export { socketService } from './services/socket.js';
export { apiService } from './services/api.js';


export { APP_CONFIG, getAppUrl } from './utils/config.js';
