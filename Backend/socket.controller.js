// socket.controller.js
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const parentModel = require('./models/parent.model');
const parentService = require('./services/parent.service');
const rideModel = require('./models/ride.model');

class SocketController {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;

        this.userId = null;
        this.userType = null;
        
        // Track reconnection attempts
        this.reconnectionAttempts = 0;
        this.maxReconnectionAttempts = 5;
    }

    // Join event handler with room-based approach
    handleJoin = async (data) => {
        const { userId, userType } = data;

        try {
            // Store user info for disconnection handling
            this.userId = userId;
            this.userType = userType;
            
            // Get room names
            const userRoom = `${userType}:${userId}`;
            const userTypeRoom = `${userType}s`; // All users of this type
            
            // Join rooms
            this.socket.join(userRoom);
            this.socket.join(userTypeRoom);
            
            console.log(`✅ ${userType} ${userId} joined rooms:`, {
                userRoom: userRoom,
                userTypeRoom: userTypeRoom
            });

            // Update database with current socket ID (still useful for tracking)
            const updateData = {
                socketId: this.socket.id,
                lastSeen: new Date(),
                isOnline: true
            };

            switch(userType) {
                case 'user':
                    await userModel.findByIdAndUpdate(userId, updateData);
                    break;
                case 'captain':
                    await captainModel.findByIdAndUpdate(userId, updateData);
                    break;
                case 'parent':
                    await parentModel.findByIdAndUpdate(userId, updateData);
                    break;
                default:
                    throw new Error(`Invalid user type: ${userType}`);
            }

            // WHERE IS THIS EMIT EVENT LISTENED TO?========================================================
            // Send connected status
            this.socket.emit('socket-connected', { 
                message: 'Successfully connected to server',
                socketId: this.socket.id,
                rooms: [userRoom, userTypeRoom]
            });

            // Reset reconnection attempts on successful join
            this.reconnectionAttempts = 0;
            
        } catch (err) {
            console.error('Error in join event:', err);
            this.socket.emit('error', { message: 'Error joining socket room' });
        }
    };


    // Captain location update handler - notify parent via rooms
    handleUpdateLocationCaptain = async (data) => {
        const { captainId, captainLocation } = data;

        if (!captainLocation || !captainLocation.lat || !captainLocation.lng) {
            console.error('at socket.controller.js, Invalid captainLocation coords');
            return this.socket.emit('error', { 
                message: 'Invalid captainLocation data: missing latitude or longitude' 
            });
        }

        try {


            // Update captain location in database
            const updatedCaptain=await captainModel.findByIdAndUpdate(
                captainId, 
                {
                    location: {
                        type: 'Point',
                        coordinates: [captainLocation.lng, captainLocation.lat]
                    },
                },
                { new: true }
            );


            
            console.log(`Captain ${updatedCaptain.fullname.firstname} captainLocation updated:`, {
                lat: updatedCaptain.location.coordinates[1],
                lng: updatedCaptain.location.coordinates[0]
            });



            // Find ongoing ride with this captain
            // what is captain has done mulitple ride with same user
            const ongoingRide = await rideModel.findOne(
                {
                    captain: captainId,
                    status: { $in: ['accepted', 'ongoing'] }
                }
            ).populate('user');



            // Notify parent via room
            if (ongoingRide && ongoingRide.user && ongoingRide.user.parentId) {
                const parentId = ongoingRide.user.parentId;
                const parentRoom = `parent:${parentId}`;
                
                // Emit to parent's room
                this.io.to(parentRoom).emit('captain-location-update-notifyPar', {
                    rideId: ongoingRide._id,
                    captainId: captainId,
                    locationCaptain: {
                        type: 'Point',
                        coordinates: [location.lng, location.lat]
                    },
                    userId: ongoingRide.user._id,
                    userName: `${ongoingRide.user.fullname.firstname} ${ongoingRide.user.fullname.lastname}`,
                    timestamp: new Date()
                });
                
                console.log(`📍 Notified parent ${parentId} in room ${parentRoom}`);
            }
        } catch (error) {
            console.error('Error updating captain location:', error);
            this.socket.emit('error', { message: 'Failed to update location' });
        }
    };

    // Ride accepted handler - notify parent via room
    // WHEN RIDE ACCEPTED, THEN FIND RIDE USING (USERiD,CAPTAINID,STATUS=ACCEPTED) THAT IS UNIQUE AND USE THIS RIDE IN handleUpdateLocationCaptain TO FIND ongoingRide
    // ============================================================
    
    handleRideAccepted = async (data) => {
        try {
            const { userId, rideId, captainId, captainLocation, captainName } = data;

            const user = await userModel.findById(userId);
            const captain = await captainModel.findById(captainId);

            if (user && user.parentId) {
                const notificationData = {
                    userId: userId,
                    rideId: rideId,
                    captainId: captainId,
                    captainName: captainName,
                    captainLocation: captainLocation,
                    message: `A ride for your child ${user.fullname.firstname} has been accepted by Captain: ${captainName}`,
                    timestamp: new Date(),
                    read: false
                };

                // Add notification to parent's database
                await parentService.addNotification(user.parentId, notificationData);

                // Send to parent's room
                const parentRoom = `parent:${user.parentId}`;
                this.io.to(parentRoom).emit('childride-accepted-notifyPar', notificationData);
                
                // Also send ride details for tracking
                const ride = await rideModel.findById(rideId)
                    .populate('captain', 'fullname vehicle location')
                    .populate('user', 'fullname');
                

                // this will be listened at useSocketEvents.js(ParentHome.jsx frontend) and will ONLY show notification at UI,no update to par data
                // HOW IS EMIT FROM BACKEND LISTENED TO IN FRONTEND?=============================
                
                this.io.to(parentRoom).emit('child-ride-started', {
                    childId: userId,
                    childName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                    ride: ride,
                    timestamp: new Date()
                });
                
                console.log(`✅ Ride accepted notification sent to parent room: ${parentRoom}`);
            }
        } catch (err) {
            console.error('Error notifying parent:', err);
        }
    };

    // Ride started handler - notify parent via room
    handleRideStarted = async (data) => {
        try {
            const { rideId } = data;
            const ride = await rideModel.findById(rideId)
                .populate('user')
                .populate('captain');

            if (ride && ride.user && ride.user.parentId) {
                const parentRoom = `parent:${ride.user.parentId}`;
                
                this.io.to(parentRoom).emit('child-ride-ongoing', {
                    userModelId: ride.user._id,
                    userName: `${ride.user.fullname.firstname} ${ride.user.fullname.lastname}`,
                    rideId: rideId,
                    captain: {
                        name: `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname}`,
                        vehicle: ride.captain.vehicle
                    },
                    startedAt: new Date(),
                    timestamp: new Date()
                });
                
                console.log(`🚗 Ride started notification to parent room: ${parentRoom}`);
            }
        } catch (err) {
            console.error('Error notifying parent of ride start:', err);
        }
    };

    // Ride ended handler - notify parent via room
    handleRideEnded = async (data) => {
        try {
            const { rideId } = data;
            const ride = await rideModel.findById(rideId)
                .populate('user')
                .populate('captain');

            if (ride && ride.user && ride.user.parentId) {
                const parentRoom = `parent:${ride.user.parentId}`;
                
                this.io.to(parentRoom).emit('child-ride-ended', {
                    userId: ride.user._id,
                    userName: `${ride.user.fullname.firstname} ${ride.user.fullname.lastname}`,
                    rideId: rideId,
                    fare: ride.fare,
                    distance: ride.distance,
                    endedAt: new Date(),
                    timestamp: new Date()
                });
                
                console.log(`🏁 Ride ended notification to parent room: ${parentRoom}`);
            }
        } catch (err) {
            console.error('Error notifying parent of ride end:', err);
        }
    };

    // Parent request sent handler - notify user via room
    handleParentRequestSent = async (data) => {
        try {
            const { userEmail, parentId, requestId } = data;
            const user = await userModel.findOne({ email: userEmail });
            const parent = await parentModel.findById(parentId);

            if (user) {
                const userRoom = `user:${user._id}`;
                
                console.log(`Parent ${parent.fullname.firstname} request sent to user ${user.email}`);
                
                this.io.to(userRoom).emit('parent-request-received', {
                    parentId: parentId,
                    parentName: `${parent.fullname.firstname} ${parent.fullname.lastname}`,
                    requestId: requestId,
                    timestamp: new Date()
                });
                
                console.log(`📨 Parent request sent to user room: ${userRoom}`);
            } else {
                console.log(`User ${userEmail} not found`);
            }
        } catch (err) {
            console.error('Error sending parent request notification:', err);
        }
    };

    // Parent request accepted handler - notify parent via room
    handleParentRequestAccepted = async (data) => {
        try {
            const { parentId, userId, userName, requestId } = data;
            
            // Notify parent via room
            const parentRoom = `parent:${parentId}`;
            
            this.io.to(parentRoom).emit('parent-request-accepted-notification', {
                userId: userId,
                userName: userName,
                requestId: requestId,
                timestamp: new Date()
            });
            
            // Also send children-list-updated event to refresh parent's UI
            this.io.to(parentRoom).emit('children-list-updated', {
                type: 'child-added',
                userId: userId,
                userName: userName,
                timestamp: new Date()
            });
            
            console.log(`✅ Parent request accepted notification to room: ${parentRoom}`);
            
            // Notify user via room
            const userRoom = `user:${userId}`;
            this.io.to(userRoom).emit('parent-status-updated', {
                parentId: parentId,
                status: 'connected',
                timestamp: new Date()
            });
            
        } catch (err) {
            console.error('Error notifying parent of request acceptance:', err);
        }
    };

    // Parent request rejected handler - notify parent via room
    handleParentRequestRejected = async (data) => {
        try {
            console.log('Parent request rejection received via socket:', data);
            const { parentId, userId, userName, requestId } = data;

            // Create clean notification data
            const notificationData = {
                userId: userId.toString(),
                userName: userName,
                requestId: requestId.toString(),
                timestamp: new Date().toISOString()
            };
            
            // Send to parent's room
            const parentRoom = `parent:${parentId}`;
            this.io.to(parentRoom).emit('parent-request-rejected-notification', notificationData);
            
            console.log(`❌ Parent request rejected notification to room: ${parentRoom}`);
            
        } catch (err) {
            console.error('Error notifying parent of request rejection:', err);
        }
    };

    // Parent request cancelled handler - notify user via room
    handleParentRequestCancelled = async (data) => {
        try {
            console.log('Parent request cancelled notification:', data);
            const { userId, requestId, parentId, parentName } = data;
            
            const userRoom = `user:${userId}`;
            
            this.io.to(userRoom).emit('parent-request-cancelled', {
                requestId: requestId,
                parentId: parentId,
                parentName: parentName,
                timestamp: data.timestamp || new Date()
            });
            
            console.log(`🗑️ Parent request cancelled to user room: ${userRoom}`);
            
        } catch (error) {
            console.error('Error broadcasting parent request cancellation:', error);
        }
    };

    // Parent removed handler - notify both parties via rooms
    handleParentRemoved = async (data) => {
        try {
            console.log('Parent removal received:', data);
            const { parentId, userId, userName, userEmail } = data;
            
            // Notify parent via room
            const parentRoom = `parent:${parentId}`;
            this.io.to(parentRoom).emit('child-removed-notification', {
                userId: userId,
                userName: userName,
                userEmail: userEmail,
                timestamp: new Date(),
                message: `${userName} has removed you as their parent.`
            });
            
            this.io.to(parentRoom).emit('children-list-updated', {
                type: 'child-removed',
                userId: userId,
                timestamp: new Date()
            });
            
            // Notify user via room
            const userRoom = `user:${userId}`;
            this.io.to(userRoom).emit('parent-removed-success', {
                parentId: parentId,
                timestamp: new Date(),
                message: 'Parent successfully removed',
                hasParent: false
            });
            
            // Update parent's notifications in database
            const notificationData = {
                userId: userId,
                userName: userName,
                userEmail: userEmail,
                message: `${userName} has removed you as their parent.`,
                timestamp: new Date(),
                read: false,
                type: 'child_removed'
            };
            
            await parentService.addNotification(parentId, notificationData);
            
            console.log(`🔗 Parent-child relationship removed, notified both rooms`);
            
        } catch (err) {
            console.error('Error handling parent removal notification:', err);
        }
    };

    // Parent removed success handler (confirmation)
    handleParentRemovedSuccess = async (data) => {
        try {
            const { userId, parentId } = data;
            const userRoom = `user:${userId}`;
            
            this.io.to(userRoom).emit('parent-removed-success', {
                parentId: parentId,
                timestamp: new Date(),
                message: 'Parent successfully removed'
            });
        } catch (err) {
            console.error('Error sending parent removal success:', err);
        }
    };

    // Get parent requests handler - send to user room
    handleGetParentRequests = async (data) => {
        try {
            const { userId } = data;
            const user = await userModel.findById(userId).populate('pendingParentRequests.parentId');
            
            if (user) {
                const userRoom = `user:${userId}`;
                this.io.to(userRoom).emit('parent-requests-list', {
                    requests: user.pendingParentRequests || [],
                    timestamp: new Date()
                });
            }
        } catch (err) {
            console.error('Error getting parent requests list:', err);
        }
    };

    // Refresh children list handler - notify parent via room
    handleRefreshChildrenList = async (data) => {
        try {
            const { parentId } = data;
            const parentRoom = `parent:${parentId}`;
            
            this.io.to(parentRoom).emit('refresh-children-list', {
                timestamp: new Date(),
                message: 'Children list refresh requested'
            });
        } catch (err) {
            console.error('Error refreshing children list:', err);
        }
    };

    // Disconnect handler
    handleDisconnect = async (reason) => {
        console.log(`🔌 Client disconnected: ${this.socket.id}, reason: ${reason}, userType: ${this.userType}, userId: ${this.userId}`);
        
        try {
            // Mark user as offline in database
            const updateData = {
                isOnline: false,
                lastSeen: new Date(),
            };

            if (this.userType === 'user' && this.userId) {
                // For client-side disconnects, keep socketId for possible reconnection
                if (reason === 'io server disconnect' || reason === 'ping timeout') {
                    await userModel.findByIdAndUpdate(
                        this.userId,
                        { $unset: { socketId: 1 }, ...updateData }
                    );
                    console.log(`❌ User ${this.userId} socket ID removed due to ${reason}`);
                } else {
                    await userModel.findByIdAndUpdate(
                        this.userId,
                        updateData
                    );
                    console.log(`📴 User ${this.userId} marked as offline`);
                }
            } 
            else if (this.userType === 'captain' && this.userId) {
                if (reason === 'io server disconnect' || reason === 'ping timeout') {
                    await captainModel.findByIdAndUpdate(
                        this.userId,
                        { $unset: { socketId: 1 }, ...updateData }
                    );
                } else {
                    await captainModel.findByIdAndUpdate(
                        this.userId,
                        updateData
                    );
                }
            } 
            else if (this.userType === "parent" && this.userId) {
                if (reason === 'io server disconnect' || reason === 'ping timeout') {
                    await parentModel.findByIdAndUpdate(
                        this.userId,
                        { $unset: { socketId: 1 }, ...updateData }
                    );
                } else {
                    await parentModel.findByIdAndUpdate(
                        this.userId,
                        updateData
                    );
                }
            } 
            else {
                // Clean up unknown connection
                await Promise.all([
                    userModel.findOneAndUpdate(
                        { socketId: this.socket.id },
                        { $unset: { socketId: 1 }, isOnline: false, lastSeen: new Date() }
                    ),
                    captainModel.findOneAndUpdate(
                        { socketId: this.socket.id },
                        { $unset: { socketId: 1 }, isOnline: false, lastSeen: new Date() }
                    ),
                    parentModel.findOneAndUpdate(
                        { socketId: this.socket.id },
                        { $unset: { socketId: 1 }, isOnline: false, lastSeen: new Date() }
                    )
                ]);
            }
            
        } catch (err) {
            console.error('Error cleaning up socket ID:', err);
        }
    };

    // Parent status update handler
    handleParentStatusUpdate = async (data) => {
        try {
            const { userId, parentId, status } = data;
            const userRoom = `user:${userId}`;
            
            this.io.to(userRoom).emit('parent-status-changed', {
                parentId: parentId,
                status: status,
                hasParent: status === 'connected',
                timestamp: new Date()
            });
        } catch (err) {
            console.error('Error updating parent status:', err);
        }
    };

    // Ping handler
    handlePing = (data) => {
        this.socket.emit('pong', { timestamp: new Date(), ...data });
    };

    // Error handler
    handleError = (error) => {
        console.error('Socket error from client:', this.socket.id, error);
    };

    

    // New method to broadcast to all users of a type
    broadcastToUserType = (userType, event, data) => {
        const room = `${userType}s`;
        this.io.to(room).emit(event, data);
        console.log(`📢 Broadcast to ${room}: ${event}`);
    };

    // New method to send to specific user
    sendToUser = (userId, userType, event, data) => {
        const room = `${userType}:${userId}`;
        this.io.to(room).emit(event, data);
        console.log(`📤 Sent to ${room}: ${event}`);
    };

    // Helper method to clean up stale socket IDs
    static async cleanupStaleSockets() {
        try {
            const timeout = 5 * 60 * 1000; // 5 minutes
            const cutoffTime = new Date(Date.now() - timeout);
            
            // Clean up users who have been offline for too long
            await userModel.updateMany(
                { 
                    isOnline: false,
                    lastSeen: { $lt: cutoffTime },
                    socketId: { $exists: true }
                },
                { $unset: { socketId: 1 } }
            );
            
            // Clean up captains
            await captainModel.updateMany(
                { 
                    isOnline: false,
                    lastSeen: { $lt: cutoffTime },
                    socketId: { $exists: true }
                },
                { $unset: { socketId: 1 } }
            );
            
            // Clean up parents
            await parentModel.updateMany(
                { 
                    isOnline: false,
                    lastSeen: { $lt: cutoffTime },
                    socketId: { $exists: true }
                },
                { $unset: { socketId: 1 } }
            );
            
            console.log('🧹 Cleaned up stale socket IDs');
        } catch (error) {
            console.error('Error cleaning up stale sockets:', error);
        }
    }

    // Static method to send message to user room (for use outside socket events)
    static sendToUserRoom = (io, userId, userType, event, data) => {
        console.log('📤 Sending message to user room:', { userId, userType, event });
        const room = `${userType}:${userId}`;
        
        if (io) {
            io.to(room).emit(event, data);
            console.log(`✅ Message sent to room ${room}`);
            return true;
        } else {
            console.log('❌ Socket.io not initialized.');
            return false;
        }
    }

    // Static method to broadcast to all users of a type
    static broadcastToUserType = (io, userType, event, data) => {
        const room = `${userType}s`;
        console.log(`📢 Broadcasting to ${room}: ${event}`);
        
        if (io) {
            io.to(room).emit(event, data);
            return true;
        }
        return false;
    }
}

// Run cleanup every 10 minutes
setInterval(() => {
    SocketController.cleanupStaleSockets();
}, 10 * 60 * 1000);

module.exports = SocketController;