

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

import UserContext from './USER/context/UserContext.jsx';
import CaptainContext from './CAPTAIN/context/CaptainContext.jsx';
import ParentContext from './PARENT/context/ParentContext.jsx';

// Lazy loading components with proper error boundaries
const withLazy = (importFunc) => lazy(() => importFunc().catch(error => {
  console.error('Lazy loading error:', error);
  return { default: () => <div>Error loading component. Please refresh.</div> };
}));

// Lazy load all components
const Start = withLazy(() => import('./Start.jsx'));
const Role = withLazy(() => import('./Role.jsx'));
const TermsOfService = withLazy(() => import('./pages.other/TermsOfService.jsx'));
const PrivaryPolicy = withLazy(() => import('./pages.other/PrivaryPolicy.jsx'));

// Login pages
const UserLogin = withLazy(() => import('./USER/UserLogin.js'));
const Captainlogin = withLazy(() => import('./CAPTAIN/Captainlogin.js'));
const ParentLogin = withLazy(() => import('./PARENT/ParentLogin.js'));

// Signup pages
const UserSignup = withLazy(() => import('./USER/UserSignup.js'));
const CaptainSignup = withLazy(() => import('./pages.signup/CaptainSignup'));
const ParentSignup = withLazy(() => import('./pages.signup/ParentSignup'));

// Home pages
const Home = withLazy(() => import('./pages.home/Home'));
const CaptainHome = withLazy(() => import('./pages.home/CaptainHome'));
const ParentHome = withLazy(() => import('./pages.home/ParentHome'));

// Protect wrappers
const UserProtectWrapper = withLazy(() => import('./USER/UserProtectWrapper.jsx'));
const CaptainProtectWrapper = withLazy(() => import('./CAPTAIN/CaptainProtectWrapper.js'));
const ParentProtectWrapper = withLazy(() => import('./PARENT/ParentProtectWrapper.jsx'));

// Logout pages
const UserLogout = withLazy(() => import('./USER/auth/UserLogout.js'));
const CaptainLogout = withLazy(() => import('./CAPTAIN/auth/CaptainLogout.js'));
const ParentLogout = withLazy(() => import('./PARENT/ParentLogout.js'));

// Riding pages
const Riding = withLazy(() => import('./USER/riding/Riding.jsx'));
const CaptainRiding = withLazy(() => import('./CAPTAIN/riding/CaptainRiding.jsx'));

// Captain components
const CaptainProfile = withLazy(() => import('./pages.home/component.captain/CaptainProfile.jsx'));
const Earnings = withLazy(() => import('./pages.home/component.captain/Earnings.jsx'));
const RideHistory = withLazy(() => import('./pages.home/component.captain/RideHistory.jsx'));
const Support = withLazy(() => import('./pages.home/component.captain/Support.jsx'));
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
        routesToPrefetch.push('/login', '/captains/login', '/parents/login');
      } else if (location.pathname === '/login') {
        routesToPrefetch.push('/signup', '/home');
      } else if (location.pathname === '/captains/login') {
        routesToPrefetch.push('/captains/signup', '/captains/home');
      } else if (location.pathname === '/parents/login') {
        routesToPrefetch.push('/parents/signup', '/parents/home');
      }
      
      // Prefetch based on user role
      if (user) {
        routesToPrefetch.push('/users/riding', '/users/logout');
      }
      if (captain) {
        routesToPrefetch.push('/captains/users/riding', '/captains/logout');
      }
      if (parent) {
        routesToPrefetch.push('/parents/logout');
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
                path="/captains/home" 
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
                path="/parents/home" 
                element={
                  <ParentProtectWrapper>
                    <ParentHome />
                  </ParentProtectWrapper>
                }
              />

              {/* Riding Routes */}
              <Route path='/users/riding' element={<Riding />} />
              <Route path='/captains/users/riding' element={<CaptainRiding />} />

              {/* Login Routes */}
              <Route path='/login' element={<UserLogin />} />
              <Route path='/captains/login' element={<Captainlogin />} />
              <Route path='/parents/login' element={<ParentLogin />} />

              {/* Signup Routes */}
              <Route path='/signup' element={<UserSignup />} />
              <Route path='/captains/signup' element={<CaptainSignup />} />
              <Route path='/parents/signup' element={<ParentSignup />} />

              {/* Logout Routes */}
              <Route 
                path='/users/logout'
                element={
                  <UserProtectWrapper>
                    <UserLogout />
                  </UserProtectWrapper>
                } 
              />
              <Route 
                path='/captains/logout' 
                element={
                  <CaptainProtectWrapper>
                    <CaptainLogout />
                  </CaptainProtectWrapper>
                } 
              />
              <Route 
                path='/parents/logout' 
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