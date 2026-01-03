import React, { lazy, Suspense, useContext } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SocketContext } from './context/SocketContext.jsx';

import UserContext from './context/UserContext.jsx';
import LoadingFallback from './optimization/LoadingFallback.jsx';

// Lazy load components
const withLazy = (importFunc) => lazy(() => importFunc().catch(error => {
  console.error('Lazy loading error:', error);
  return { default: () => <div>Error loading component. Please refresh.</div> };
}));

// Lazy load User components
const UserLogin = withLazy(() => import('./auth/UserLogin.jsx'));
const UserSignup = withLazy(() => import('./auth/UserSignup.jsx'));
const UserLogout = withLazy(() => import('./auth/UserLogout.jsx'));

const UserHome = withLazy(() => import('./Home.jsx'));
const UserProtectWrapper = withLazy(() => import('./UserProtectWrapper.jsx'));
const Riding = withLazy(() => import('./riding/Riding.jsx'));

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

// Route optimizer for User app
// const UserRouteOptimizer = ({ children }) => {
//   const location = useLocation();
//   const { user } = useContext(UserContext) || {};
//   const { isConnected } = useContext(SocketContext) || {};
  
//   React.useEffect(() => {
//     // Store current route
//     sessionStorage.setItem('user_lastVisitedRoute', location.pathname);
    
//     // Store user context state
//     if (user) {
//       sessionStorage.setItem('userContext', JSON.stringify(user));
//     }
    
//     // Prefetch routes based on current location
//     const prefetchRoutes = () => {
//       const routesToPrefetch = [];
      
//       if (location.pathname === '/') {
//         routesToPrefetch.push('/login', '/signup');
//       } else if (location.pathname === '/login') {
//         routesToPrefetch.push('/signup', '/home');
//       } else if (location.pathname === '/signup') {
//         routesToPrefetch.push('/login', '/home');
//       }
      
//       if (user) {
//         routesToPrefetch.push('/riding', '/logout');
//       }
      
//       // Remove duplicates
//       const uniqueRoutes = [...new Set(routesToPrefetch)];
      
//       uniqueRoutes.forEach(route => {
//         const link = document.createElement('link');
//         link.rel = 'prefetch';
//         link.href = route;
//         link.as = 'document';
//         document.head.appendChild(link);
//       });
//     };
    
//     prefetchRoutes();
    
//     // Set app type in localStorage for cross-app communication
//     localStorage.setItem('appType', 'user');
//   }, [location, user, isConnected]);

//   return children;
// };

const App = () => {
  return (
    <ErrorBoundary>
      {/* <UserRouteOptimizer> */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />

            
            {/* Protected Routes */}
            <Route 
              path="/home" 
              element={
                <UserProtectWrapper>
                  <UserHome />
                </UserProtectWrapper>
              } 
            />
            
            <Route 
              path="/riding" 
              element={
                <UserProtectWrapper>
                  <Riding />
                </UserProtectWrapper>
              } 
            />
            
            <Route 
              path="/logout" 
              element={
                <UserProtectWrapper>
                  <UserLogout />
                </UserProtectWrapper>
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                  <p className="text-white/80 mb-6">The page you're looking for doesn't exist in the User app.</p>
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              } 
            />
          </Routes>
        </Suspense>
      {/* </UserRouteOptimizer> */}
    </ErrorBoundary>
  );
};

export default App;