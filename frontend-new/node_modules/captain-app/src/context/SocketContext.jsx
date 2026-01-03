import React, { createContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {  // Export as named export
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        // Get backend URL from environment variables
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        if (!backendUrl) {
            console.error('❌ VITE_BACKEND_URL is not defined in environment variables');
            setConnectionError('Backend URL is not configured');
            return;
        }

        console.log('🔧 Socket Context - Backend URL:', backendUrl);

        const socketInstance = io(backendUrl, {
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
        };

        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);
        socketInstance.on('reconnect', (attemptNumber) => {
            console.log(`🔁 Socket reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
        });

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

// Keep default export for backward compatibility
export default SocketProvider;