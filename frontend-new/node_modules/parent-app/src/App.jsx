import React, { lazy, Suspense, useContext } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SocketContext } from '@shared';
import ParentContext from './context/ParentContext.jsx';
// import LoadingFallback from '@shared';

// Lazy load components
const withLazy = (importFunc) => lazy(() => importFunc().catch(error => {
  console.error('Lazy loading error:', error);
  return { default: () => <div>Error loading component. Please refresh.</div> };
}));

// Lazy load Parent components
const ParentLogin = withLazy(() => import('./auth/ParentLogin.jsx'));
const ParentSignup = withLazy(() => import('./auth/ParentSignup.jsx'));
const ParentHome = withLazy(() => import('./ParentHome.jsx'));
const ParentProtectWrapper = withLazy(() => import('./ParentProtectWrapper.jsx'));
const ParentLogout = withLazy(() => import('./auth/ParentLogout.jsx'));
const LiveTracking = withLazy(() => import('./components/TrackingSection.jsx'));

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: '#fee',
          borderRadius: '8px',
          margin: '2rem'
        }}>
          <h3>Something went wrong</h3>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Route optimizer for Parent app
const ParentRouteOptimizer = ({ children }) => {
  const location = useLocation();
  const { parent } = useContext(ParentContext) || {};
  const { isConnected } = useContext(SocketContext) || {};
  
  React.useEffect(() => {
    // Store current route
    sessionStorage.setItem('parent_lastVisitedRoute', location.pathname);
    
    // Store parent context state
    if (parent) {
      sessionStorage.setItem('parentContext', JSON.stringify(parent));
    }
    
    // Prefetch routes based on current location
    const prefetchRoutes = () => {
      const routesToPrefetch = [];
      
      if (location.pathname === '/') {
        routesToPrefetch.push('/login', '/signup');
      } else if (location.pathname === '/login') {
        routesToPrefetch.push('/signup', '/home');
      } else if (location.pathname === '/signup') {
        routesToPrefetch.push('/login', '/home');
      }
      
      if (parent) {
        routesToPrefetch.push('/logout');
      }
      
      // Remove duplicates
      const uniqueRoutes = [...new Set(routesToPrefetch)];
      
      uniqueRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
      });
    };
    
    prefetchRoutes();
    
    // Set app type in localStorage for cross-app communication
    localStorage.setItem('appType', 'parent');
  }, [location, parent, isConnected]);

  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <ParentRouteOptimizer>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ParentLogin />} />
            <Route path="/login" element={<ParentLogin />} />
            <Route path="/signup" element={<ParentSignup />} />
            
            {/* Protected Routes */}
            <Route 
              path="/home" 
              element={
                <ParentProtectWrapper>
                  <ParentHome />
                </ParentProtectWrapper>
              } 
            />
            
            <Route 
              path="/tracking" 
              element={
                <ParentProtectWrapper>
                  <LiveTracking />
                </ParentProtectWrapper>
              } 
            />
            
            <Route 
              path="/logout" 
              element={
                <ParentProtectWrapper>
                  <ParentLogout />
                </ParentProtectWrapper>
              } 
            />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div style={{
                  textAlign: 'center',
                  padding: '4rem',
                  height: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)'
                }}>
                  <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                  <p className="text-white/80 mb-6">The page you're looking for doesn't exist in the Parent app.</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              } 
            />
          </Routes>
        </Suspense>
      </ParentRouteOptimizer>
    </ErrorBoundary>
  );
};

export default App;