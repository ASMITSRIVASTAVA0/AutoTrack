import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import UserContext from './context/UserContext.jsx';
import CaptainContext from './context/CaptainContext.jsx';
import SocketProvider from './context/SocketContext.jsx';
import ParentContext from './context/ParentContext.jsx';
import RoutePreloader from './optimization/RoutePreloader.jsx';
import 'remixicon/fonts/remixicon.css';


createRoot(document.getElementById('root')).render(
  <UserContext>
    <CaptainContext>
      <ParentContext>
        <SocketProvider>
          <BrowserRouter>
            <RoutePreloader />
            <App />
          </BrowserRouter>
        </SocketProvider>
      </ParentContext>
    </CaptainContext>
  </UserContext>
);