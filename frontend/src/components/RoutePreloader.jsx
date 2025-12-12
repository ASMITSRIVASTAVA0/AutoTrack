import React, { useEffect } from 'react';

const RoutePreloader = () => {
  useEffect(() => {
    // Function to preload specific components based on route patterns
    const preloadComponents = async () => {
      const currentPath = window.location.pathname;
      
      try {
        // Preload based on current route
        if (currentPath === '/' || currentPath === '/role') {
          // Preload login components
          await Promise.all([
            import('../pages.login/UserLogin'),
            import('../pages.login/Captainlogin'),
            import('../pages.login/ParentLogin')
          ]);
        } else if (currentPath.includes('/login')) {
          // Preload signup components
          await Promise.all([
            import('../pages.signup/UserSignup'),
            import('../pages.signup/CaptainSignup'),
            import('../pages.signup/ParentSignup')
          ]);
        } else if (currentPath === '/home' || currentPath === '/captain-home' || currentPath === '/parent-home') {
          // Preload riding and logout components
          await Promise.all([
            import('../pages.riding/Riding'),
            import('../pages.riding/CaptainRiding'),
            import('../pages.logout/UserLogout'),
            import('../pages.logout/CaptainLogout'),
            import('../pages.logout/ParentLogout')
          ]);
        }
      } catch (error) {
        console.warn('Preloading failed:', error);
      }
    };
    
    // Also add link preloading for likely next routes
    const addLinkPrefetch = () => {
      const currentPath = window.location.pathname;
      const routesToPrefetch = [];
      
      if (currentPath === '/') {
        routesToPrefetch.push('/role');
      } else if (currentPath === '/role') {
        routesToPrefetch.push('/login', '/captain-login', '/parent-login');
      } else if (currentPath === '/login') {
        routesToPrefetch.push('/signup');
      } else if (currentPath === '/captain-login') {
        routesToPrefetch.push('/captain-signup');
      } else if (currentPath === '/parent-login') {
        routesToPrefetch.push('/parent-signup');
      }
      
      routesToPrefetch.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
      });
    };
    
    preloadComponents();
    addLinkPrefetch();
    
    // Cleanup function
    return () => {
      // Remove any prefetch links we added
      const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
      prefetchLinks.forEach(link => {
        if (link.parentNode === document.head) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RoutePreloader;