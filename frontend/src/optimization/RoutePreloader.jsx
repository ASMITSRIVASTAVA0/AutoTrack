import React, { useEffect } from 'react';

const RoutePreloader = () => {
  useEffect(() => {
    // Function to preload specific components based on route patterns
    const preloadComponents = async () => {
      const currentPath = window.location.pathname;
      
      try {
        // Preload based on current route
        if (currentPath === '/' ){
          await Promise.all([
            import("../pages.startup/Role"),
            import("../pages.other/PrivaryPolicy.jsx"),
            import("../pages.other/TermsOfService.jsx"),
            import("../pages.riding/LiveTrackingStatic.jsx"),
          ]);
          console.log("at RoutePreloader.jsx, loaded /role,privarypolicy,termsofservice");
        }
        else if (currentPath === '/role') {
          // Preload login components
          await Promise.all([
            import('../pages.login/UserLogin'),
            import('../pages.login/Captainlogin'),
            import('../pages.login/ParentLogin')
          ]);
          console.log("at RoutePreloader.jsx, loaded /UserLogin,CaptainLogin,ParentLogin");
        } 
        else if(currentPath==="/captain-login"){
          await Promise.all([
            import("../pages.signup/CaptainSignup.jsx"),
            import("../pages.home/CaptainHome.jsx"),
            import("../pages.riding/CaptainRiding.jsx")
          ]);
          console.log("at captain-login, loaded signup,home,riding");
        }
        else if(currentPath==="/login"){
          await Promise.all([
            import("../pages.signup/UserSignup.jsx"),
            import("../pages.home/Home.jsx"),
            import("../pages.riding/Riding.jsx")

          ]);
          console.log("at captain-login, loaded signup,home,riding");
        }
        else if (currentPath.includes('/login')) {
          // Preload signup components
          await Promise.all([
            import('../pages.signup/UserSignup'),
            import('../pages.signup/CaptainSignup'),
            import('../pages.signup/ParentSignup'),

            import("../pages.home/CaptainHome"),
            import("../pages.home/Home"),
            import("../pages.home/ParentHome"),

            import("../pages.protectwrapper/CaptainProtectWrapper"),
            import("../pages.protectwrapper/ParentProtectWrapper"),
            import("../pages.protectwrapper/UserProtectWrapper")
          ]);

          console.log("at RoutePreloader.jsx, loaded signup,home,protectedwrapper ");
            
        } else if (currentPath === '/home' || currentPath === '/captain-home' || currentPath === '/parent-home') {
          // Preload riding and logout components
          await Promise.all([
            import('../pages.riding/CaptainRiding'),
            import("../pages.riding/FinishRide.jsx"),
            import('../pages.riding/Riding'),


            import('../pages.logout/UserLogout'),
            import('../pages.logout/CaptainLogout'),
            import('../pages.logout/ParentLogout')
          ]);
          console.log("at RoutePreloader.jsx, loaded riding,logout");
            
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
      console.log("at routePreloader.jsx, addLinkPrefetch func, document head children="+document.head.children);
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