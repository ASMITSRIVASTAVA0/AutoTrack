import React, { createContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        // Get backend URL from environment variables
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        // Debug log to check the URL
        console.log('🔧 Socket Context - Backend URL:', backendUrl);
        
        if (!backendUrl) {
            console.error('❌ VITE_BACKEND_URL is not defined in environment variables');
            setConnectionError('Backend URL is not configured');
            return;
        }

        // Create socket connection with proper URL construction
        const socketUrl = backendUrl.startsWith('http') ? 
            backendUrl.replace('http', 'ws') : 
            `ws://${backendUrl}`;
            
        console.log('🔌 Connecting to WebSocket:', socketUrl);

        const socketInstance = io(backendUrl, {  // Use backendUrl directly, socket.io will handle protocol
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
            autoConnect: true,
            forceNew: false,
            
        });

        setSocket(socketInstance);

        // Connection event handlers
        const handleConnect = () => {
            console.log('✅ Socket connected with ID:', socketInstance.id);
            setIsConnected(true);
            setConnectionError(null);
        };

        const handleDisconnect = (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
            
            if (reason === 'io server disconnect') {
                socketInstance.connect();
            }
        };

        const handleConnectError = (error) => {
            console.error('Socket connection error:', error);
            setConnectionError(error.message);
            console.log('Connection details:', {
                url: backendUrl,
                connected: socketInstance.connected,
                id: socketInstance.id
            });
        };

        // Setup event listeners
        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);
        socketInstance.on('reconnect', (attemptNumber) => {
            console.log(`🔁 Socket reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
        });

        // Test connection
        socketInstance.on('connect', () => {
            console.log('📡 WebSocket connection established successfully');
        });

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up socket connection');
            if (socketInstance) {
                socketInstance.off('connect', handleConnect);
                socketInstance.off('disconnect', handleDisconnect);
                socketInstance.off('connect_error', handleConnectError);
                socketInstance.disconnect();
            }
        };
    }, []);

    const contextValue = useMemo(() => ({
        socket,
        isConnected,
        connectionError,
        reconnect: () => {
            if (socket && !socket.connected) {
                console.log('🔄 Manual reconnection triggered');
                socket.connect();
            }
        }
    }), [socket, isConnected, connectionError]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;