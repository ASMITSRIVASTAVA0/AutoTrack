// Environment-based configuration
export const APP_CONFIG = {
  landing: {
    port: 3000,
    domain: import.meta.env.VITE_LANDING_DOMAIN || 'http://localhost:3000',
    name: 'Landing'
  },
  captain: {
    port: 3001,
    domain: import.meta.env.VITE_CAPTAIN_DOMAIN || 'http://localhost:3001',
    name: 'Captain'
  },
  parent: {
    port: 3002,
    domain: import.meta.env.VITE_PARENT_DOMAIN || 'http://localhost:3002',
    name: 'Parent'
  },
  user: {
    port: 3003,
    domain: import.meta.env.VITE_USER_DOMAIN || 'http://localhost:3003',
    name: 'User'
  }
};

export const getAppUrl = (appName) => {
  return APP_CONFIG[appName]?.domain || APP_CONFIG[appName]?.port;
};