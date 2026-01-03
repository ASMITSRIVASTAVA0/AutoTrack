import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext.jsx';  // Import SocketProvider, not SocketContext
import UserContext from './context/UserContext.jsx';

createRoot(document.getElementById('root')).render(
  <SocketProvider>  {/* Use SocketProvider here */}
    <BrowserRouter>
      <UserContext>
        <App />
      </UserContext>
    </BrowserRouter>
  </SocketProvider>
);