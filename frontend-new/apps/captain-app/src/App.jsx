import React, { lazy, Suspense, useContext } from 'react';
import { Route, Routes, useLocation, Outlet } from 'react-router-dom';
// import { SocketContext } from '@shared';
import CaptainContext from './context/CaptainContext.jsx';
// import LoadingFallback from '@shared';

// Lazy load components
const withLazy = (importFunc) => lazy(() => importFunc().catch(error => {
  console.error('Lazy loading error:', error);
  return { default: () => <div>Error loading component. Please refresh.</div> };
}));

// Lazy load Captain components
const CaptainLogin = withLazy(() => import('./auth/CaptainLogin.jsx'));
const CaptainSignup = withLazy(() => import('./auth/CaptainSignup.jsx'));
const CaptainHome = withLazy(() => import('./CaptainHome.jsx'));
const CaptainProtectWrapper = withLazy(() => import('./CaptainProtectWrapper.jsx'));
const CaptainLogout = withLazy(() => import('./auth/CaptainLogout.jsx'));
const CaptainRiding = withLazy(() => import('./riding/CaptainRiding.jsx'));
const FinishRide = withLazy(() => import('./riding/FinishRide.jsx'));
const CaptainProfile = withLazy(() => import('./components/CaptainProfile.jsx'));
const Earnings = withLazy(() => import('./components/Earnings.jsx'));
const RideHistory = withLazy(() => import('./components/RideHistory.jsx'));
const Support = withLazy(() => import('./components/Support.jsx'));

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

// Captain Home Layout with nested routes
const CaptainHomeLayout = () => {
  return (
    <CaptainProtectWrapper>
      <CaptainHome />
      <Outlet />
    </CaptainProtectWrapper>
  );
};

// Route optimizer for Captain app
const CaptainRouteOptimizer = ({ children }) => {
  const location = useLocation();
  const { captain } = useContext(CaptainContext) || {};
  const { isConnected } = useContext(SocketContext) || {};
  
  React.useEffect(() => {
    // Store current route
    sessionStorage.setItem('captain_lastVisitedRoute', location.pathname);
    
    // Store captain context state
    if (captain) {
      sessionStorage.setItem('captainContext', JSON.stringify(captain));
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
      
      if (captain) {
        routesToPrefetch.push(
          '/home/profile',
          '/home/history',
          '/home/earnings',
          '/home/support',
          '/riding',
          '/finish-ride',
          '/logout'
        );
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
    localStorage.setItem('appType', 'captain');
  }, [location, captain, isConnected]);

  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <CaptainRouteOptimizer>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CaptainLogin />} />
            <Route path="/login" element={<CaptainLogin />} />
            <Route path="/signup" element={<CaptainSignup />} />
            
            {/* Protected Routes with nested layout */}
            <Route path="/home" element={<CaptainHomeLayout />}>
              <Route path="profile" element={<CaptainProfile />} />
              <Route path="history" element={<RideHistory />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="support" element={<Support />} />
              <Route index element={null} /> {/* Empty for home */}
            </Route>
            
            <Route 
              path="/riding" 
              element={
                <CaptainProtectWrapper>
                  <CaptainRiding />
                </CaptainProtectWrapper>
              } 
            />
            
            <Route 
              path="/finish-ride" 
              element={
                <CaptainProtectWrapper>
                  <FinishRide />
                </CaptainProtectWrapper>
              } 
            />
            
            <Route 
              path="/logout" 
              element={
                <CaptainProtectWrapper>
                  <CaptainLogout />
                </CaptainProtectWrapper>
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
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%)'
                }}>
                  <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                  <p className="text-white/80 mb-6">The page you're looking for doesn't exist in the Captain app.</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              } 
            />
          </Routes>
        </Suspense>
      </CaptainRouteOptimizer>
    </ErrorBoundary>
  );
};

export default App;