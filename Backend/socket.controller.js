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

    // Join event handler
    // handleJoin = async (data) => {
    //     const { userId, userType } = data;

    //     try {
    //         if (userType === 'user') {
    //             const user = await userModel.findByIdAndUpdate(
    //                 userId, 
    //                 { socketId: this.socket.id, lastSeen: new Date() },
    //                 { new: true }
    //             );
    //             console.log(`User ${user?.fullname?.firstname} joined with socket ${this.socket.id}`);
    //         } else if (userType === 'captain') {
    //             const captain = await captainModel.findByIdAndUpdate(
    //                 userId, 
    //                 { socketId: this.socket.id, lastSeen: new Date() },
    //                 { new: true }
    //             );
    //             console.log(`Captain ${captain?.fullname?.firstname} joined with socket ${this.socket.id}`);
    //         } else if (userType === "parent") {
    //             const parent = await parentModel.findByIdAndUpdate(
    //                 userId,
    //                 { socketId: this.socket.id, lastSeen: new Date() },
    //                 { new: true }
    //             );
    //             console.log(`Parent ${parent?.fullname?.firstname} joined with socket ${this.socket.id}`);
                
    //             // Send connected status
    //             this.socket.emit('socket-connected', { message: 'Successfully connected to server' });
    //         }
    //     } catch (err) {
    //         console.error('Error in join event:', err);
    //         this.socket.emit('error', { message: 'Error joining socket room' });
    //     }
    // };

    handleJoin = async (data) => {
        const { userId, userType } = data;

        try {
            // Store user info for disconnection handling
            this.userId = userId;
            this.userType = userType;
            
            const updateData = {
                socketId: this.socket.id,
                lastSeen: new Date(),
                isOnline: true
            };

            if (userType === 'user') {
                const user = await userModel.findByIdAndUpdate(
                    userId, 
                    updateData,
                    { new: true }
                );
                console.log(`👤 User ${user?.fullname?.firstname} joined with socket ${this.socket.id}`);
            } else if (userType === 'captain') {
                const captain = await captainModel.findByIdAndUpdate(
                    userId, 
                    updateData,
                    { new: true }
                );
                console.log(`🚗 Captain ${captain?.fullname?.firstname} joined with socket ${this.socket.id}`);
            } else if (userType === "parent") {
                const parent = await parentModel.findByIdAndUpdate(
                    userId,
                    updateData,
                    { new: true }
                );
                console.log(`👨‍👩‍👧‍👦 Parent ${parent?.fullname?.firstname} joined with socket ${this.socket.id}`);
                
                // Send connected status
                this.socket.emit('socket-connected', { 
                    message: 'Successfully connected to server',
                    socketId: this.socket.id 
                });
            }

            // Reset reconnection attempts on successful join
            this.reconnectionAttempts = 0;
            
        } catch (err) {
            console.error('Error in join event:', err);
            this.socket.emit('error', { message: 'Error joining socket room' });
        }
    };


    // Captain location update handler
    handleUpdateLocationCaptain = async (data) => {
        const { captainId, location } = data;

        if (!location || location.lat === undefined || location.lng === undefined) {
            console.error('Invalid locationdata=', location);
            return this.socket.emit('error', { 
                message: 'Invalid location data: missing latitude or longitude at socket.js' 
            });
        }

        try {
            // Update captain location in database
            await captainModel.findByIdAndUpdate(captainId, {
                location: {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                },
            });
            
            console.log(`Captain ${captainId} location updated at socket.js:`, {
                lat: location.lat,
                lng: location.lng
            });

            // Notify parents if this captain has an ongoing ride with their child
            const ongoingRide = await rideModel.findOne({
                captain: captainId,
                status: { $in: ['accepted', 'ongoing'] }
            }).populate('user');

            if (ongoingRide && ongoingRide.user && ongoingRide.user.parentId) {
                const parent = await parentModel.findById(ongoingRide.user.parentId);
                
                if (parent && parent.socketId) {
                    this.io.to(parent.socketId).emit('captain-location-update-notifyPar', {
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
                    console.log(`Notified parent ${parent._id} of captain location update at socket.js`);
                }
            }
        } catch (error) {
            console.error('Error updating captain location at socket.js:', error);
            this.socket.emit('error', { message: 'Failed to update location at socket.js' });
        }
    };

    // Ride accepted handler
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
                    message: `A ride for your child ${user.fullname.firstname} has been accepted  by Captain: ${captainName}`,
                    timestamp: new Date(),
                    read: false
                };

                // add this notification to parent.nofitications array in db
                await parentService.addNotification(user.parentId, notificationData);

                const parent = await parentModel.findById(user.parentId);

                if (parent && parent.socketId) {
                    this.io.to(parent.socketId).emit('ride-accepted-notification', notificationData);
                    
                    // Also send ride details for tracking
                    const ride = await rideModel.findById(rideId)
                        .populate('captain', 'fullname vehicle location')
                        .populate('user', 'fullname');
                    
                    this.io.to(parent.socketId).emit('child-ride-started', {
                        childId: userId,
                        childName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                        ride: ride,
                        timestamp: new Date()
                    });
                }
            }
        } catch (err) {
            console.error('Error notifying parent:', err);
        }
    };

    // Ride started handler
    handleRideStarted = async (data) => {
        try {
            const { rideId } = data;
            const ride = await rideModel.findById(rideId)
                .populate('user')
                .populate('captain');

            if (ride && ride.user && ride.user.parentId) {
                const parent = await parentModel.findById(ride.user.parentId);
                if (parent && parent.socketId) {
                    this.io.to(parent.socketId).emit('child-ride-ongoing', {
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
                }
            }
        } catch (err) {
            console.error('Error notifying parent of ride start at socket.js:', err);
        }
    };

    // Ride ended handler
    handleRideEnded = async (data) => {
        try {
            const { rideId } = data;
            const ride = await rideModel.findById(rideId)
                .populate('user')
                .populate('captain');

            if (ride && ride.user && ride.user.parentId) {
                const parent = await parentModel.findById(ride.user.parentId);
                if (parent && parent.socketId) {
                    this.io.to(parent.socketId).emit('child-ride-ended', {
                        userId: ride.user._id,
                        userName: `${ride.user.fullname.firstname} ${ride.user.fullname.lastname}`,
                        rideId: rideId,
                        fare: ride.fare,
                        distance: ride.distance,
                        endedAt: new Date(),
                        timestamp: new Date()
                    });
                }
            }
        } catch (err) {
            console.error('Error notifying parent of ride end:', err);
        }
    };

    // Parent request sent handler
    handleParentRequestSent = async (data) => {
        try {
            const { userEmail, parentId, requestId } = data;
            const user = await userModel.findOne({ email: userEmail });
            const parent = await parentModel.findById(parentId);

            if (user && user.socketId) {
                console.log(`Parentname=${parent.fullname.firstname} request sent to user ${user.email} at socket.js`);
                this.io.to(user.socketId).emit('parent-request-received', {
                    parentId: parentId,
                    parentName: `${parent.fullname.firstname} ${parent.fullname.lastname}`,
                    requestId: requestId,
                    timestamp: new Date()
                });
            } else {
                console.log(`User ${userEmail} not found or not online at socket.js`);
            }
        } catch (err) {
            console.error('Error sending parent request notification at socket.js: ', err);
        }
    };

    // Parent request accepted handler
    handleParentRequestAccepted = async (data) => {
        try {
            const { parentId, userId, userName, requestId } = data;
            const parent = await parentModel.findById(parentId);

            if (parent && parent.socketId) {
                this.io.to(parent.socketId).emit('parent-request-accepted-notification', {
                    userId: userId,
                    userName: userName,
                    requestId: requestId,
                    timestamp: new Date()
                });
                console.log(`Parent ${parent.fullname.firstname} notified of request acceptance at socket.js`);
                
                // Update parent's pending requests
                this.io.to(parent.socketId).emit('pending-requests-updated', {
                    type: 'request-accepted',
                    requestId: requestId,
                    userId: userId,
                    timestamp: new Date()
                });
            }
        } catch (err) {
            console.error('Error notifying parent of request acceptance at socket.js:', err);
        }
    };

    // Parent request rejected handler
    handleParentRequestRejected = async (data) => {
        try {
            console.log('Parent request rejection received via socket:', data);
            const { parentId, userId, userName, requestId } = data;
            const parent = await parentModel.findById(parentId);

            if (parent && parent.socketId) {
                console.log(`Emitting parent-request-rejected-notification to parent ${parent._id}`);
                
                this.io.to(parent.socketId).emit('parent-request-rejected-notification', {
                    userId: userId,
                    userName: userName,
                    requestId: requestId,
                    timestamp: new Date()
                });
                
                // Also emit a specific event to update pending requests
                this.io.to(parent.socketId).emit('pending-requests-updated', {
                    type: 'request-rejected',
                    requestId: requestId,
                    timestamp: new Date()
                });
                
                console.log(`Parent ${parent.fullname.firstname} notified of request rejection at socket.js`);
            }
        } catch (err) {
            console.error('Error notifying parent of request rejection at socket.js:', err);
        }
    };

    // Parent request cancelled handler
    handleParentRequestCancelled = async (data) => {
        try {
            console.log('Parent request cancelled notification:', data);
            
            const user = await userModel.findById(data.userId).select('socketId');
            
            if (user && user.socketId) {
                this.io.to(user.socketId).emit('parent-request-cancelled', {
                    requestId: data.requestId,
                    parentId: data.parentId,
                    parentName: data.parentName,
                    timestamp: data.timestamp || new Date()
                });
                console.log(`Sent parent-request-cancelled to user ${data.userId} with socket ${user.socketId}`);
            }
        } catch (error) {
            console.error('Error broadcasting parent request cancellation:', error);
        }
    };

    // Parent removed handler
    handleParentRemoved = async (data) => {
        try {
            console.log('Parent removal received:', data);
            const { parentId, userId, userName, userEmail } = data;
            
            const parent = await parentModel.findById(parentId);
            
            if (parent && parent.socketId) {
                // Send notification to parent
                this.io.to(parent.socketId).emit('child-removed-notification', {
                    userId: userId,
                    userName: userName,
                    userEmail: userEmail,
                    timestamp: new Date(),
                    message: `${userName} has removed you as their parent and is no longer your child.`
                });
                
                console.log(`Notified parent ${parent.fullname.firstname} of removal at socket.js`);
                
                // Also update parent's children list in real-time
                this.io.to(parent.socketId).emit('children-list-updated', {
                    type: 'child-removed',
                    userId: userId,
                    timestamp: new Date()
                });
            }
            
            // Also update parent's notifications in database
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
            
        } catch (err) {
            console.error('Error handling parent removal notification at socket.js:', err);
        }
    };

    // Parent removed success handler
    handleParentRemovedSuccess = async (data) => {
        try {
            const { userId, parentId } = data;
            const user = await userModel.findById(userId);
            
            if (user && user.socketId) {
                this.io.to(user.socketId).emit('parent-removed-success', {
                    parentId: parentId,
                    timestamp: new Date(),
                    message: 'Parent successfully removed'
                });
            }
        } catch (err) {
            console.error('Error sending parent removal success:', err);
        }
    };

    // Get parent requests handler
    handleGetParentRequests = async (data) => {
        try {
            const { userId } = data;
            const user = await userModel.findById(userId).populate('pendingParentRequests.parentId');
            
            if (user && user.socketId) {
                this.io.to(user.socketId).emit('parent-requests-list', {
                    requests: user.pendingParentRequests || [],
                    timestamp: new Date()
                });
            }
        } catch (err) {
            console.error('Error getting parent requests list at socket.js:', err);
        }
    };

    // Refresh children list handler
    handleRefreshChildrenList = async (data) => {
        try {
            const { parentId } = data;
            const parent = await parentModel.findById(parentId);
            
            if (parent && parent.socketId) {
                this.io.to(parent.socketId).emit('refresh-children-list', {
                    timestamp: new Date(),
                    message: 'Children list refresh requested'
                });
            }
        } catch (err) {
            console.error('Error refreshing children list:', err);
        }
    };

    // Disconnect handler
    // handleDisconnect = async (reason) => {
    //     console.log(`Client disconnected: ${this.socket.id}, reason: ${reason}`);
        
    //     try {
    //         // Remove socket ID from users
    //         await userModel.findOneAndUpdate(
    //             { socketId: this.socket.id },
    //             { 
    //                 $unset: { socketId: 1 },
    //                 $set: { lastSeen: new Date() }
    //             }
    //         );
            
    //         // Remove socket ID from captains
    //         await captainModel.findOneAndUpdate(
    //             { socketId: this.socket.id },
    //             { 
    //                 $unset: { socketId: 1 },
    //                 $set: { lastSeen: new Date() }
    //             }
    //         );
            
    //         // Remove socket ID from parents
    //         await parentModel.findOneAndUpdate(
    //             { socketId: this.socket.id },
    //             { 
    //                 $unset: { socketId: 1 },
    //                 $set: { lastSeen: new Date() }
    //             }
    //         );
    //     } catch (err) {
    //         console.error('Error cleaning up socket ID at socket.js:', err);
    //     }
    // };

    handleDisconnect = async (reason) => {
        console.log(`🔌 Client disconnected: ${this.socket.id}, reason: ${reason}, userType: ${this.userType}, userId: ${this.userId}`);
        
        try {
            // Don't immediately remove socket ID - wait for possible reconnection
            // Instead, mark as offline and set a grace period
            
            const updateData = {
                isOnline: false,
                lastSeen: new Date(),
                // We'll keep the socketId temporarily for reconnection matching
            };

            if (this.userType === 'user' && this.userId) {
                // Only clear socketId if this is a server-initiated disconnect or ping timeout
                if (reason === 'io server disconnect' || reason === 'ping timeout') {
                    await userModel.findByIdAndUpdate(
                        this.userId,
                        { $unset: { socketId: 1 }, ...updateData }
                    );
                    console.log(`❌ User ${this.userId} socket ID removed due to ${reason}`);
                } else {
                    // For client-side disconnects, keep socketId for a while
                    await userModel.findByIdAndUpdate(
                        this.userId,
                        updateData
                    );
                    console.log(`📴 User ${this.userId} marked as offline, keeping socketId for possible reconnection`);
                }
            } 
            else if (this.userType === 'captain' && this.userId) {
                if (reason === 'io server disconnect' || reason === 'ping timeout') {
                    await captainModel.findByIdAndUpdate(
                        this.userId,
                        { $unset: { socketId: 1 }, ...updateData }
                    );
                    console.log(`❌ Captain ${this.userId} socket ID removed due to ${reason}`);
                } else {
                    await captainModel.findByIdAndUpdate(
                        this.userId,
                        updateData
                    );
                    console.log(`📴 Captain ${this.userId} marked as offline, keeping socketId`);
                }
            } 
            else if (this.userType === "parent" && this.userId) {
                if (reason === 'io server disconnect' || reason === 'ping timeout') {
                    await parentModel.findByIdAndUpdate(
                        this.userId,
                        { $unset: { socketId: 1 }, ...updateData }
                    );
                    console.log(`❌ Parent ${this.userId} socket ID removed due to ${reason}`);
                } else {
                    await parentModel.findByIdAndUpdate(
                        this.userId,
                        updateData
                    );
                    console.log(`📴 Parent ${this.userId} marked as offline, keeping socketId`);
                }
            } 
            else {
                // If we don't have user info, clean up by socketId as before
                // This handles cases where join wasn't completed
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
                console.log(`🧹 Cleaned up unknown connection with socket ${this.socket.id}`);
            }
            
        } catch (err) {
            console.error('Error cleaning up socket ID at socket.js:', err);
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

    handleReconnect = async () => {
        this.reconnectionAttempts++;
        
        if (this.reconnectionAttempts > this.maxReconnectionAttempts) {
            console.log(`⚠️ Too many reconnection attempts for user ${this.userId}, type ${this.userType}`);
            // Force remove socket ID after too many attempts
            if (this.userType === 'user' && this.userId) {
                await userModel.findByIdAndUpdate(
                    this.userId,
                    { $unset: { socketId: 1 }, isOnline: false }
                );
            } else if (this.userType === 'captain' && this.userId) {
                await captainModel.findByIdAndUpdate(
                    this.userId,
                    { $unset: { socketId: 1 }, isOnline: false }
                );
            } else if (this.userType === 'parent' && this.userId) {
                await parentModel.findByIdAndUpdate(
                    this.userId,
                    { $unset: { socketId: 1 }, isOnline: false }
                );
            }
        }
    };

    // Helper method to clean up stale socket IDs (run periodically)
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
            
            // Clean up captains who have been offline for too long
            await captainModel.updateMany(
                { 
                    isOnline: false,
                    lastSeen: { $lt: cutoffTime },
                    socketId: { $exists: true }
                },
                { $unset: { socketId: 1 } }
            );
            
            // Clean up parents who have been offline for too long
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


}

// Static method to send message to specific socket
// Static method to send message to specific socket
SocketController.sendMessageToSocketId = (io, socketId, messageObject) => {
    console.log('📤 Sending message to socket:', socketId, messageObject);

    if (io) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.connected) {
            socket.emit(messageObject.event, messageObject.data);
            console.log(`✅ Message sent to socket ${socketId}`);
            return true;
        } else {
            console.log(`❌ Socket ${socketId} not found or not connected`);
            return false;
        }
    } else {
        console.log('❌ Socket.io not initialized.');
        return false;
    }
}

// Run cleanup every 10 minutes
setInterval(() => {
    SocketController.cleanupStaleSockets();
}, 10 * 60 * 1000);

module.exports = SocketController;
