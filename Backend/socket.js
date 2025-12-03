const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const parentModel = require('./models/parent.model');
const parentService = require('./services/parent.service');
const rideModel = require('./models/ride.model');

let io;


// http is one way communication protocol, client must ask every time
// websocket is two way communication protocol, server and client can send messages anytime


// socket.io library makes websockets easier to use
const socketIo = require('socket.io');
// inside socket.io
//    socket=one connected client
//    io=all connected clients
//    event=message type
//    emit=send message
//    on=listen for message
//    broadcast=send to all except sender 
//    room=group of sockets

function initializeSocket(server) {//server is http server defined in server.js 

    // socketIo(server,options) attach socket.io to raw http server, now clients can connect via websockets
    io = socketIo(server, {
        cors: {
            origin: [
                "http://localhost:4000",
                'http://localhost:3000',
                'http://localhost:5173', 
                'https://autotrack-frontend.vercel.app',
                // 'https://*.vercel.app'
            ],
            methods: [ 'GET', 'POST' ]
        }
    });


    // socket.emit() send event only to curr connected client
    // io.emit() sends event to all connected clients including sender
    // socket.broadcast.emit() all client except sender

    // When a client connects
    io.on('connection', (socket) => {//socket is one connected client having unique socket.id
        console.log(`Client connected: ${socket.id}`);


        // socket.on("event-name",(data)=>{});//Listen for event
        // socket.emit("event-name",data);//Send event named as "event-name" with data to connected peer(client/server)

        // User joins
        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'user') 
            {
                const user=await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                console.log(`User ${user.fullname.firstname} joined with socket ${socket.id}`);
            } 
            else if (userType === 'captain') {
                const captain=await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
                console.log(`Captain ${captain.fullname.firstname} joined with socket ${socket.id}`);
            }
            else if(userType === "parent"){
                
            }
        });

        // Parent joins
        socket.on('parent-join', async (parentId) => {
            const parent=await parentModel.findByIdAndUpdate(parentId, { socketId: socket.id });
            console.log(`Parent ${parent.fullname.firstname} joined with socket ${socket.id}`);
        });

        // Captain location update - MERGED VERSION
        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            // Validate for both latitude and longitude
            if (!location || location.lat === undefined || location.lng === undefined) {
                console.error('Invalid location data: found', location);
                return socket.emit('error', { 
                    message: 'Invalid location data: missing latitude or longitude at socket.js' 
                });
            }

            try {
                // Update captain location in database
                await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        type: 'Point',
                        coordinates: [location.lng, location.lat] // [longitude, latitude]
                    }
                });
                
                console.log(`Captain ${userId} location updated to at socket.js:`, {
                    lat: location.lat,
                    lng: location.lng,
                    coordinates: [location.lng, location.lat]
                });

                // Notify parents if this captain has an ongoing ride with their child
                const ongoingRide = await rideModel.findOne({
                    captain: userId,
                    status: { $in: ['accepted', 'ongoing'] }
                }).populate('user');

                if (ongoingRide && ongoingRide.user && ongoingRide.user.parentId) {
                    const parent = await parentModel.findById(ongoingRide.user.parentId);
                    if (parent && parent.socketId) {
                        io.to(parent.socketId).emit('captain-location-update', {
                            rideId: ongoingRide._id,
                            captainId: userId,
                            location: {
                                type: 'Point',
                                coordinates: [location.lng, location.lat]
                            },
                            childId: ongoingRide.user._id,
                            childName: `${ongoingRide.user.fullname.firstname} ${ongoingRide.user.fullname.lastname}`
                        });
                        console.log(`Notified parent ${parent._id} of captain location update at socket.js`);
                    }
                }

                // Also notify the user who booked the ride
                if (ongoingRide && ongoingRide.user && ongoingRide.user.socketId) {
                    io.to(ongoingRide.user.socketId).emit('captain-location-update', {
                        rideId: ongoingRide._id,
                        captainId: userId,
                        location: {
                            type: 'Point',
                            coordinates: [location.lng, location.lat]
                        }
                    });
                }

            } catch (error) {
                console.error('Error updating captain location at socket.js:', error);
                socket.emit('error', { message: 'Failed to update location at socket.js' });
            }
        });

        // User location update
        socket.on('update-location-user', async (data) => {
            try {
                const { userId, location } = data;

                await userModel.findByIdAndUpdate(userId, { 
                    location: {
                        type: 'Point',
                        coordinates: [location.lng, location.lat]
                    }
                });

                const user = await userModel.findById(userId);
                if (user && user.parentId) {
                    const parent = await parentModel.findById(user.parentId);
                    if (parent && parent.socketId) {
                        io.to(parent.socketId).emit('child-location-updated', {
                            userId: userId,
                            userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                            location: {
                                type: 'Point',
                                coordinates: [location.lng, location.lat]
                            },
                            timestamp: new Date()
                        });
                    }
                }
            } catch (err) {
                console.error('Error updating user location at socket.js:', err);
            }
        });

        // Ride accepted by captain - notify parent
        socket.on('ride-accepted', async (data) => {
            try {
                const { userId, rideId, captainId, captainLocation } = data;

                const user = await userModel.findById(userId);
                const captain = await captainModel.findById(captainId);

                if (user && user.parentId) {
                    const notificationData = {
                        userId: userId,
                        rideId: rideId,
                        captainId: captainId,
                        captainName: `${captain.fullname.firstname} ${captain.fullname.lastname}`,
                        captainLocation: captainLocation,
                        message: `A ride for your child ${user.fullname.firstname} has been accepted. Captain: ${captain.fullname.firstname}`,
                        timestamp: new Date(),
                        read: false
                    };

                    await parentService.addNotification(user.parentId, notificationData);

                    const parent = await parentModel.findById(user.parentId);
                    if (parent && parent.socketId) {
                        io.to(parent.socketId).emit('ride-accepted-notification', notificationData);
                        
                        // Also send ride details for tracking
                        const ride = await rideModel.findById(rideId)
                            .populate('captain', 'fullname vehicle location')
                            .populate('user', 'fullname');
                        
                        io.to(parent.socketId).emit('child-ride-started', {
                            childId: userId,
                            childName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                            ride: ride
                        });
                    }
                }
            } catch (err) {
                console.error('Error notifying parent:', err);
            }
        });

        // Ride started - notify parent
        socket.on('ride-started', async (data) => {
            try {
                const { rideId } = data;
                const ride = await rideModel.findById(rideId)
                    .populate('user')
                    .populate('captain');

                if (ride && ride.user && ride.user.parentId) {
                    const parent = await parentModel.findById(ride.user.parentId);
                    if (parent && parent.socketId) {
                        io.to(parent.socketId).emit('child-ride-ongoing', {
                            childId: ride.user._id,
                            childName: `${ride.user.fullname.firstname} ${ride.user.fullname.lastname}`,
                            rideId: rideId,
                            captain: {
                                name: `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname}`,
                                vehicle: ride.captain.vehicle
                            },
                            startedAt: new Date()
                        });
                    }
                }
            } catch (err) {
                console.error('Error notifying parent of ride start at socket.js:', err);
            }
        });

        // Ride ended - notify parent
        socket.on('ride-ended', async (data) => {
            try {
                const { rideId } = data;
                const ride = await rideModel.findById(rideId)
                    .populate('user')
                    .populate('captain');

                if (ride && ride.user && ride.user.parentId) {
                    const parent = await parentModel.findById(ride.user.parentId);
                    if (parent && parent.socketId) {
                        io.to(parent.socketId).emit('child-ride-ended', {
                            childId: ride.user._id,
                            childName: `${ride.user.fullname.firstname} ${ride.user.fullname.lastname}`,
                            rideId: rideId,
                            fare: ride.fare,
                            distance: ride.distance,
                            endedAt: new Date()
                        });
                    }
                }
            } catch (err) {
                console.error('Error notifying parent of ride end:', err);
            }
        });

        // Handle parent request to user
        socket.on('parent-request-sent', async (data) => {
            try {
                const { userEmail, parentId } = data;
                const user = await userModel.findOne({ email: userEmail });
                const parent = await parentModel.findById(parentId);

                if (user && user.socketId) {
                    console.log(`Parentname=${parent.fullname.firstname} request sent to user ${user.email} at socket.js`);
                    io.to(user.socketId).emit('parent-request-received', {
                        parentId: parentId,
                        parentName: `${parent.fullname.firstname} ${parent.fullname.lastname}`,
                        timestamp: new Date()
                    });
                } else {
                    console.log(`User ${userEmail} not found or not online at socket.js`);
                }
            } catch (err) {
                console.error('Error sending parent request notification at socket.js: ', err);
            }
        });

        // Handle parent request acceptance
        socket.on('parent-request-accepted', async (data) => {
            try {
                const { parentId, userId, userName } = data;
                const parent = await parentModel.findById(parentId);

                if (parent && parent.socketId) {
                    io.to(parent.socketId).emit('parent-request-accepted-notification', {
                        userId: userId,
                        userName: userName,
                        timestamp: new Date()
                    });
                    console.log(`Parent ${parent.fullname.firstname} notified of request acceptance at socket.js`);
                }
            } catch (err) {
                console.error('Error notifying parent of request acceptance at socket.js:', err);
            }
        });

        // Handle parent request rejection
        socket.on('parent-request-rejected', async (data) => {
            try {
                const { parentId, userId, userName } = data;
                const parent = await parentModel.findById(parentId);

                if (parent && parent.socketId) {
                    io.to(parent.socketId).emit('parent-request-rejected-notification', {
                        userId: userId,
                        userName: userName,
                        timestamp: new Date()
                    });
                    console.log(`Parent ${parent.fullname.firstname} notified of request rejection at socket.js`);
                }
            } catch (err) {
                console.error('Error notifying parent of request rejection at socket.js:', err);
            }
        });

        // Handle user response to parent request
        socket.on('parent-request-response', async (data) => {
            try {
                const { parentId, userId, accepted } = data;
                const parent = await parentModel.findById(parentId);
                const user = await userModel.findById(userId);

                if (parent && parent.socketId) {
                    io.to(parent.socketId).emit('parent-request-updated', {
                        userId: userId,
                        userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                        accepted: accepted,
                        timestamp: new Date()
                    });
                }
            } catch (err) {
                console.error('Error handling parent request response at socket.js:', err);
            }
        });

        // Handle user requesting parent requests
        socket.on('get-parent-requests', async (data) => {
            try {
                const { userId } = data;
                const user = await userModel.findById(userId).populate('pendingParentRequests.parentId');
                
                if (user && user.socketId) {
                    io.to(user.socketId).emit('parent-requests-list', {
                        requests: user.pendingParentRequests || []
                    });
                }
            } catch (err) {
                console.error('Error getting parent requests list at socket.js:', err);
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);
            
            try {
                // Remove socket ID from users
                await userModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { $unset: { socketId: 1 } }
                );
                
                // Remove socket ID from captains
                await captainModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { $unset: { socketId: 1 } }
                );
                
                // Remove socket ID from parents
                await parentModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { $unset: { socketId: 1 } }
                );
            } catch (err) {
                console.error('Error cleaning up socket ID at socket.js:', err);
            }
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {
    console.log('Sending message to socket:', socketId, messageObject);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
        
