
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        // Create socket connection
        const socketInstance = io(`${import.meta.env.VITE_BASE_URL}`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
            forceNew: false, // Important: reuse connection
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
                // Server disconnected, try to reconnect
                socketInstance.connect();
            }
        };

        const handleConnectError = (error) => {
            console.error('Socket connection error:', error);
            setConnectionError(error.message);
        };

        // Setup event listeners
        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);
        socketInstance.on('reconnect', (attemptNumber) => {
            console.log(`🔁 Socket reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
        });

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up socket connection');
            socketInstance.off('connect', handleConnect);
            socketInstance.off('disconnect', handleDisconnect);
            socketInstance.off('connect_error', handleConnectError);
            socketInstance.disconnect();
        };
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        socket,
        isConnected,
        connectionError,
        reconnect: () => {
            if (socket && !socket.connected) {
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