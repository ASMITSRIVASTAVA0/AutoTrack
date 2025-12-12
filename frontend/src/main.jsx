// // import { StrictMode } from 'react'
// // // detect unsafe lifecycles, runs effects twice to find side effects, warns about deprecated APIs


// // import { createRoot } from 'react-dom/client'
// // import './index.css'
// // import App from './App.jsx'


// // import { BrowserRouter } from 'react-router-dom';
// // // uses HTML5 history API for navigation without page reloads.
// // // Type of routers=BrowserRouter, HashRouter (uses hash in url), MemoryRouter(keep url in memory for testing)
// // // browserrouter requires server configuration for all routes with hashrouter doesnot


// // import UserContext from './context/UserContext.jsx';
// // import CaptainContext from './context/CaptainContext.jsx';
// // import SocketProvider from './context/SocketContext.jsx';
// // import ParentContext from './context/ParentContext.jsx';


// // // index.html me div ki id="root" h

// // // createRoot is react-18 rendering API that enable concurrent features while ReactDOM.render is legacy API,
// // // so better batching of state updates acroess promises, timeouts, and events
// // // can interrrupt rendering for urgent updates like input typing
// // createRoot(document.getElementById('root')).render(


// //   // <UserContext and CaptainContext pass data through component tree without manuallly passing props at each level
// //   // solve prop drilling problem, ordering of context matters, outer context available to inner context but not vice versa
// //   <CaptainContext>
// //     <UserContext>
// //       <ParentContext>
// //         <SocketProvider>
// //           <BrowserRouter>
// //             <App />
// //           </BrowserRouter>
// //         </SocketProvider>
// //       </ParentContext>
// //     </UserContext>
// //   </CaptainContext>

// // )


// // // promise=eventual completion or failure of an async oper, 3 states, pending, fulfilled, rejected

// import { StrictMode } from 'react'
// // detect unsafe lifecycles, runs effects twice to find side effects, warns about deprecated APIs


// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'


// import { BrowserRouter } from 'react-router-dom';
// // uses HTML5 history API for navigation without page reloads.
// // Type of routers=BrowserRouter, HashRouter (uses hash in url), MemoryRouter(keep url in memory for testing)
// // browserrouter requires server configuration for all routes with hashrouter doesnot


// import UserContext from './context/UserContext.jsx';
// import CaptainContext from './context/CaptainContext.jsx';
// import SocketProvider from './context/SocketContext.jsx';
// import ParentContext from './context/ParentContext.jsx';

// // index.html me div ki id="root" h

// // createRoot is react-18 rendering API that enable concurrent features while ReactDOM.render is legacy API,
// // so better batching of state updates acroess promises, timeouts, and events
// // can interrrupt rendering for urgent updates like input typing
// createRoot(document.getElementById('root')).render(


//   // <UserContext and CaptainContext pass data through component tree without manuallly passing props at each level
//   // solve prop drilling problem, ordering of context matters, outer context available to inner context but not vice versa
//       <UserContext>
//       <CaptainContext>
//         <ParentContext>
//           <SocketProvider>
//             <BrowserRouter>
//               <App />
//             </BrowserRouter>
//           </SocketProvider>
//         </ParentContext>
//       </CaptainContext>
//     </UserContext>

// )


// // promise=eventual completion or failure of an async oper, 3 states, pending, fulfilled, rejected


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import UserContext from './context/UserContext.jsx';
import CaptainContext from './context/CaptainContext.jsx';
import SocketProvider from './context/SocketContext.jsx';
import ParentContext from './context/ParentContext.jsx';
import RoutePreloader from './components/RoutePreloader.jsx';

// Import remixicon styles
import 'remixicon/fonts/remixicon.css';

// Initialize session storage for tab isolation
const initializeTabSession = () => {
  // Generate a unique tab ID if not exists
  if (!sessionStorage.getItem('tabId')) {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tabId', tabId);
  }
  
  // Check for context data transferred from another tab
  const tabTransferData = sessionStorage.getItem('tabTransferData');
  if (tabTransferData) {
    try {
      const data = JSON.parse(tabTransferData);
      const now = Date.now();
      // Only use data if it's less than 5 seconds old
      if (now - data.timestamp < 5000) {
        console.log('Received context data from another tab');
        // Data is available for context providers to use if needed
      }
      // Clear the transfer data
      sessionStorage.removeItem('tabTransferData');
    } catch (error) {
      console.error('Error parsing tab transfer data:', error);
      sessionStorage.removeItem('tabTransferData');
    }
  }
};

// Run initialization
initializeTabSession();

createRoot(document.getElementById('root')).render(
    <UserContext>
      <CaptainContext>
        <ParentContext>
          <SocketProvider>
            <BrowserRouter>
              {/* <RoutePreloader /> */}
              <App />
            </BrowserRouter>
          </SocketProvider>
        </ParentContext>
      </CaptainContext>
    </UserContext>
);