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
//   <CaptainContext>
//     <UserContext>
//       <ParentContext>
//         <SocketProvider>
//           <BrowserRouter>
//             <App />
//           </BrowserRouter>
//         </SocketProvider>
//       </ParentContext>
//     </UserContext>
//   </CaptainContext>

// )


// // promise=eventual completion or failure of an async oper, 3 states, pending, fulfilled, rejected

import { StrictMode } from 'react'
// detect unsafe lifecycles, runs effects twice to find side effects, warns about deprecated APIs


import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


import { BrowserRouter } from 'react-router-dom';
// uses HTML5 history API for navigation without page reloads.
// Type of routers=BrowserRouter, HashRouter (uses hash in url), MemoryRouter(keep url in memory for testing)
// browserrouter requires server configuration for all routes with hashrouter doesnot


import UserContext from './context/UserContext.jsx';
import CaptainContext from './context/CaptainContext.jsx';
import SocketProvider from './context/SocketContext.jsx';
import ParentContext from './context/ParentContext.jsx';

// index.html me div ki id="root" h

// createRoot is react-18 rendering API that enable concurrent features while ReactDOM.render is legacy API,
// so better batching of state updates acroess promises, timeouts, and events
// can interrrupt rendering for urgent updates like input typing
createRoot(document.getElementById('root')).render(


  // <UserContext and CaptainContext pass data through component tree without manuallly passing props at each level
  // solve prop drilling problem, ordering of context matters, outer context available to inner context but not vice versa
      <UserContext>
      <CaptainContext>
        <ParentContext>
          <SocketProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SocketProvider>
        </ParentContext>
      </CaptainContext>
    </UserContext>

)


// promise=eventual completion or failure of an async oper, 3 states, pending, fulfilled, rejected