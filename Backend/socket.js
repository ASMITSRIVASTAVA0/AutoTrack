const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            // origin: '*',
            origin: [
                "http://localhost:4000",
                'http://localhost:3000',
                'http://localhost:5173', 
                'https://autotrack-frontend.vercel.app',
                'https://*.vercel.app'
            ],
            methods: [ 'GET', 'POST' ]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);


        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
            }
        });


        socket.on('update-location-captain', async (data) => {
                
            const { userId, location } = data;

            // Validate for both latitude and longitude
            if (!location || location.lat === undefined || location.lng === undefined) {
                console.error('Invalid location data: found', location);
                return socket.emit('error', { 
                    message: 'Invalid location data: missing latitude or longitude' 
                });
            }

            try {
                // Update with complete GeoJSON format

                await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        type: 'Point',
                        coordinates: [location.lng, location.lat] // [longitude, latitude]
                    }
                });
                
                console.log(`Captain ${userId} location updated to:`, {
                    lat: location.lat,
                    lng: location.lng,
                    coordinates: [location.lng, location.lat]
                });
            } catch (error) {
                console.error('Error updating captain location:', error);
                socket.emit('error', { message: 'Failed to update location' });
            }
        });


        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {

    console.log(messageObject);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };