

// /*
// v5 route syntax <Route path='' component={} />
// v6 route syntax <Route path='' element={} />
// v6 uses element prop to pass JSX element to render for that route
// */

// /*
// useNavigate: programmatic navigation after form submit or useEffect
// Link: declarative navigation via clickable links
// */

// /*
// token-based auth(persistent auth)
// localStorage: persists until manually cleared
// sessionStorage: clears when tab/browser closed
// cookies: can set expiration, sent with every HTTP request to server
// */



import React, { lazy, Suspense, useContext, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

/*
useLocation=hook that return curr URL location obj, 
including pathname(curr route via location.pathname),query params, url fragment(#sectioni)
updates whenever url changes
*/

import UserContext from './context/UserContext';
import CaptainContext from './context/CaptainContext';
import ParentContext from './context/ParentContext';

// Lazy loading components with proper error boundaries
const withLazy = (importFunc) => lazy(() => importFunc().catch(error => {
  console.error('Lazy loading error:', error);
  return { default: () => <div>Error loading component. Please refresh.</div> };
}));

// Lazy load all components
const Start = withLazy(() => import('./pages.startup/Start'));
const Role = withLazy(() => import('./pages.startup/Role'));
const TermsOfService = withLazy(() => import('./pages.other/TermsOfService.jsx'));
const PrivaryPolicy = withLazy(() => import('./pages.other/PrivaryPolicy.jsx'));

// Login pages
const UserLogin = withLazy(() => import('./pages.login/UserLogin'));
const Captainlogin = withLazy(() => import('./pages.login/Captainlogin'));
const ParentLogin = withLazy(() => import('./pages.login/ParentLogin'));

// Signup pages
const UserSignup = withLazy(() => import('./pages.signup/UserSignup'));
const CaptainSignup = withLazy(() => import('./pages.signup/CaptainSignup'));
const ParentSignup = withLazy(() => import('./pages.signup/ParentSignup'));

// Home pages
const Home = withLazy(() => import('./pages.home/Home'));
const CaptainHome = withLazy(() => import('./pages.home/CaptainHome'));
const ParentHome = withLazy(() => import('./pages.home/ParentHome'));

// Protect wrappers
const UserProtectWrapper = withLazy(() => import('./pages.protectwrapper/UserProtectWrapper'));
const CaptainProtectWrapper = withLazy(() => import('./pages.protectwrapper/CaptainProtectWrapper'));
const ParentProtectWrapper = withLazy(() => import('./pages.protectwrapper/ParentProtectWrapper'));

// Logout pages
const UserLogout = withLazy(() => import('./pages.logout/UserLogout'));
const CaptainLogout = withLazy(() => import('./pages.logout/CaptainLogout'));
const ParentLogout = withLazy(() => import('./pages.logout/ParentLogout'));

// Riding pages
const Riding = withLazy(() => import('./pages.riding/Riding'));
const CaptainRiding = withLazy(() => import('./pages.riding/CaptainRiding'));

// Captain components
const CaptainProfile = withLazy(() => import('./components/compo.captain.info/CaptainProfile.jsx'));
const Earnings = withLazy(() => import('./components/compo.captain.info/Earnings.jsx'));
const RideHistory = withLazy(() => import('./components/compo.captain.info/RideHistory.jsx'));
const Support = withLazy(() => import('./components/compo.captain.info/Support.jsx'));
import LoadingFallback from "./optimization/LoadingFallback.jsx";

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

// Component to handle route-based optimizations
const RouteOptimizer = ({ children }) => {
  const location = useLocation();
  const { user } = useContext(UserContext) || {};
  const { captain } = useContext(CaptainContext) || {};
  const { parent } = useContext(ParentContext) || {};
  
  useEffect(() => {
    // Store current route in session storage
    sessionStorage.setItem('lastVisitedRoute', location.pathname);
    
    // Store user context state in session storage for tab isolation
    if (user) {
      sessionStorage.setItem('userContext', JSON.stringify(user));
    }
    if (captain) {
      sessionStorage.setItem('captainContext', JSON.stringify(captain));
    }
    if (parent) {
      sessionStorage.setItem('parentContext', JSON.stringify(parent));
    }
    
    // Prefetch likely next routes based on current location and user role
    const prefetchRoutes = () => {
      const routesToPrefetch = [];
      
      if (location.pathname === '/') {
        routesToPrefetch.push('/role');
      } else if (location.pathname === '/role') {
        routesToPrefetch.push('/login', '/captain-login', '/parent-login');
      } else if (location.pathname === '/login') {
        routesToPrefetch.push('/signup', '/home');
      } else if (location.pathname === '/captain-login') {
        routesToPrefetch.push('/captain-signup', '/captain-home');
      } else if (location.pathname === '/parent-login') {
        routesToPrefetch.push('/parent-signup', '/parent-home');
      }
      
      // Prefetch based on user role
      if (user) {
        routesToPrefetch.push('/riding', '/user/logout');
      }
      if (captain) {
        routesToPrefetch.push('/captain-riding', '/captain/logout');
      }
      if (parent) {
        routesToPrefetch.push('/parent/logout');
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
  }, [location, user, captain, parent]);

  return children;
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <RouteOptimizer>
        <Suspense fallback={<LoadingFallback />}>
          <div>
            <Routes>
              {/* Public Routes */}
              <Route path='/' element={<Start />} />
              <Route path='/role' element={<Role />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="/privacypolicy" element={<PrivaryPolicy />} />
              
              {/* User Routes */}
              <Route
                path='/home'
                element={
                  <UserProtectWrapper>
                    <Home />
                  </UserProtectWrapper>
                }
              />
              
              {/* Captain Routes with nested routes */}
              <Route 
                path="/captain-home" 
                element={
                  <CaptainProtectWrapper>
                    <CaptainHome />
                  </CaptainProtectWrapper>
                }
              >
                <Route path="profile" element={<CaptainProfile />} />
                <Route path="history" element={<RideHistory />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* Parent Routes */}
              <Route 
                path="/parent-home" 
                element={
                  <ParentProtectWrapper>
                    <ParentHome />
                  </ParentProtectWrapper>
                }
              />

              {/* Riding Routes */}
              <Route path='/riding' element={<Riding />} />
              <Route path='/captain-riding' element={<CaptainRiding />} />

              {/* Login Routes */}
              <Route path='/login' element={<UserLogin />} />
              <Route path='/captain-login' element={<Captainlogin />} />
              <Route path='/parent-login' element={<ParentLogin />} />

              {/* Signup Routes */}
              <Route path='/signup' element={<UserSignup />} />
              <Route path='/captain-signup' element={<CaptainSignup />} />
              <Route path='/parent-signup' element={<ParentSignup />} />

              {/* Logout Routes */}
              <Route 
                path='/user/logout'
                element={
                  <UserProtectWrapper>
                    <UserLogout />
                  </UserProtectWrapper>
                } 
              />
              <Route 
                path='/captain/logout' 
                element={
                  <CaptainProtectWrapper>
                    <CaptainLogout />
                  </CaptainProtectWrapper>
                } 
              />
              <Route 
                path='/parent/logout' 
                element={
                  <ParentProtectWrapper>
                    <ParentLogout />
                  </ParentProtectWrapper>
                } 
              />

              {/* 404 Route - Keep at bottom */}
              <Route 
                path='*' 
                element={
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        marginTop: '1rem'
                      }}
                    >
                      Go to Home
                    </button>
                  </div>
                } 
              />
            </Routes>
          </div>
        </Suspense>
      </RouteOptimizer>
    </ErrorBoundary>
  );
};

export default App;