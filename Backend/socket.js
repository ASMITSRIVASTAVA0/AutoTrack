const SocketController = require('./socket.controller');

let io;

const socketIo = require('socket.io');

function initializeSocket(server) {
    // io defined kiya
    io = socketIo(server, {
        cors: {
            origin: [
                "http://localhost:4000",
                'http://localhost:3000',
                'http://localhost:5173', 
                'https://autotrack-frontend.vercel.app',
            ],
            methods: [ 'GET', 'POST' ],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        connectionStateRecovery: {
            // Enable connection state recovery
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
            skipMiddlewares: true,
        }
    });

    io.on('connection', (socket) => {
        
        console.log(`Client connected with socketid=: ${socket.id}`);

        // Create controller instance for this socket
        const controller = new SocketController(io, socket);

        // User joins
        socket.on('join', controller.handleJoin);

        // Handle reconnection events
        socket.on('reconnect', () => {
            console.log(`🔄 Socket ${socket.id} reconnected`);
            controller.handleReconnect();
        });

        // Handle reconnection attempts
        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Socket reconnection attempt ${attemptNumber} for ${socket.id}`);
        });

        // Captain location update, and notify ONLY parent
        socket.on('update-location-captain', controller.handleUpdateLocationCaptain);

        // Ride accepted by captain - notify parent
        socket.on('ride-accepted', controller.handleRideAccepted);

        // Ride started - notify parent
        socket.on('ride-started', controller.handleRideStarted);

        // Ride ended - notify parent
        socket.on('ride-ended', controller.handleRideEnded);

        // Handle parent request to user
        socket.on('parent-request-sent', controller.handleParentRequestSent);

        // Handle parent request acceptance
        socket.on('parent-request-accepted', controller.handleParentRequestAccepted);

        // Handle parent request rejection
        socket.on('parent-request-rejected', controller.handleParentRequestRejected);

        // Handle parent request cancellation
        socket.on('parent-request-cancelled', controller.handleParentRequestCancelled);

        // Handle user removing parent - notify parent
        socket.on('parent-removed', controller.handleParentRemoved);

        // Handle parent-removed-success (confirmation to user)
        socket.on('parent-removed-success', controller.handleParentRemovedSuccess);

        // Handle user requesting parent requests
        socket.on('get-parent-requests', controller.handleGetParentRequests);

        // Handle children list refresh request
        socket.on('refresh-children-list', controller.handleRefreshChildrenList);

        // Handle disconnect
        socket.on('disconnect', controller.handleDisconnect);

        // Heartbeat/ping handler
        socket.on('ping', controller.handlePing);

        // Error handler
        socket.on('error', controller.handleError);
    });

    // Handle server-wide events
    io.engine.on("connection_error", (err) => {
        console.error('Connection error:', err);
    });

    // inital cleanup of stale sockets
    SocketController.cleanupStaleSockets();

}

const sendMessageToSocketId = (socketId, messageObject) => {
    SocketController.sendMessageToSocketId(io, socketId, messageObject);
}

module.exports = { initializeSocket, sendMessageToSocketId };