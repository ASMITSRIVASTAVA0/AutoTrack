import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
// import { SocketContext } from '@shared';
import "./index.css";
createRoot(document.getElementById('root')).render(
  <SocketContext>
    <BrowserRouter>
      {/* <App /> */}
    </BrowserRouter>
  </SocketContext>
);