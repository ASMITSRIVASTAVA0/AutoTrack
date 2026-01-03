const parentModel = require('../models/parent.model');
const userModel = require('../models/user.model');
const blackListTokenModel = require('../models/blacklistToken.model');
const parentService = require('../services/parent.service');
const { validationResult } = require('express-validator');
const { sendToUserRoom } = require('../socket');
        
module.exports.registerParent = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log("validation failed at register post req in parent.controller.js");
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    const parentAlreadyExist = await parentModel.findOne({ email });

    if (parentAlreadyExist) {
        return res.status(400).json({ message: 'Parent with this email already exists' });
    }

    const hashedPassword = await parentModel.hashPassword(password);

    const parent = await parentService.createParent({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    const tokenParent = parent.generateAuthToken();

    res.cookie('tokenParent', tokenParent);

    res.status(201).json({ tokenParent, parent });
}

module.exports.loginParent = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("login validation failed at parent.controller.js");
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const parent = await parentModel.findOne({ email }).select('+password');

    if (!parent) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await parent.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokenParent = parent.generateAuthToken();

    res.cookie('tokenParent', tokenParent);

    res.status(200).json({ tokenParent, parent });
}

module.exports.logoutParent = async (req, res, next) => {
    try {
        const tokenParent = req.cookies.tokenParent || req.headers.authorization?.split(' ')[1];

        await blackListTokenModel.create({ token: tokenParent });

        res.clearCookie('tokenParent');
        console.log("par logout at parent.controller.js");
        res.status(200).json({ message: 'Logged-out' });
    } catch (err) {
        console.log("error at par logout at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}

module.exports.getParentProfile = async (req, res, next) => {
    try {
        const parent = await parentModel.findById(req.parent._id)
            .populate('children');

        console.log("getparprofile called at parent.controller.js par=",parent.fullname.firstname);
        res.status(200).json({ parent });
    } catch (err) {
        console.log("error at getparprofile called at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}

// parent.controller.js - UPDATED sendChildRequest function
module.exports.sendChildRequest = async (req, res, next) => {
    try {
        const { userEmail } = req.body;
        const parentId = req.parent._id;

        console.log(`sendChildRequest called at parent.controller.js, child email=${userEmail} parid=${parentId}`);

        // Find user by email
        const user = await userModel.findOne({ email:userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Found user at controller.js : ${user.fullname.firstname}`);

        // Check if request already exists
        const existingRequest = user.pendingParentRequests.find(
            req => req.parentId.toString() === parentId.toString()
        );
        
        if (existingRequest) {
            return res.status(400).json({ 
                message: 'Request already sent to this user' 
            });
        }

        // Create new request
        const newRequest = {
            parentId: parentId,
            status: 'pending',
            requestedAt: new Date()
        };

        // Add request to user's pending requests
        user.pendingParentRequests.push(newRequest);
        const updatedUser=await user.save();

        // Add request to parent's pending child requests
        const updatedParent=await parentModel.findByIdAndUpdate(
            parentId,
            {
                $addToSet: {
                    pendingChildRequests: {
                        userId: user._id,
                        status: 'pending',
                        requestedAt: new Date()
                    }
                }
            }
        );

        console.log(`New request created for user ${updatedUser.fullname.firstname} by parent ${updatedParent.fullname.firstname}`);
        console.log(`User pending requests count: ${user.pendingParentRequests.length}`);

        // ✅ FIXED: Send socket event ONLY ONCE
        
        // Send to user's room (this should be the ONLY emit)
        sendToUserRoom(`user:${user._id}`, {
            event: 'parent-request-received',
            data: {
                parentId: parentId,
                parentName: `${updatedParent.fullname.firstname} ${updatedParent.fullname.lastname}`,
                requestId: newRequest._id,
                timestamp: new Date()
            }
        });

        console.log(`✅ Parent request sent to user ${userEmail}`);

        res.status(200).json({
            message: 'Request sent successfully',
            requestId: newRequest._id,
            user: {
                id: updatedUser._id,
                name: `${updatedUser.fullname.firstname} ${updatedUser.fullname.lastname}`
            }
        });
    } catch (err) {
        console.error('Error sending child request:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports.removeChild = async (req, res, next) => {
    try {
        const { childId } = req.params;
        const parentId = req.parent._id;
        
        // Get parent and child details before removal
        const parent = await parentModel.findById(parentId);
        const child = await userModel.findById(childId);
        
        // Remove child from parent
        const updatedParent = await parentService.removeChildFromParent(parentId, childId);

        // Remove parent reference from child
        const updatedUser = await userModel.findByIdAndUpdate(
            childId, 
            { parentId: null },
            { new: true }
        );

        console.log(`removechild at parent.controller.js with childname=${child.fullname.firstname}, childparupdated=${updatedUser.parentId} and parname=${parent.fullname.firstname}`);
        
        // Notify parent via room
        sendToUserRoom(parentId, 'parent', 'children-list-updated', {
            type: 'child-removed',
            userId: childId,
            timestamp: new Date(),
            message: `${child.fullname.firstname} has been removed from your children list`
        });

        // Notify child via room
        sendToUserRoom(childId, 'user', 'parent-removed-success', {
            parentId: parentId,
            timestamp: new Date(),
            message: 'Parent successfully removed',
            hasParent: false
        });

        res.status(200).json({ 
            message: 'Child removed successfully', 
            parent: updatedParent 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await parentService.getParentNotifications(req.parent._id);
        console.log("getnotification called at parent.controller.js");
        res.status(200).json({ notifications });
    } catch (err) {
        console.log("err getting notification at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}

module.exports.markNotificationAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;
        const parentId = req.parent._id;

        const parent = await parentService.markNotificationsAsRead(parentId, notificationId);
        console.log(`marked notificationid=${notificationId}, parname=${parent.fullname.firstname}`);
        res.status(200).json({ message: 'Notification marked as read', parent });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports.getPendingRequests = async (req, res, next) => {
    try {
        const parent = await parentModel.findById(req.parent._id)
            .populate('pendingChildRequests.userId', 'fullname email');

        console.log("getpendingreq called at parent.controller.js, pendingreq count=",parent.pendingChildRequests.length);
        res.status(200).json({ requests: parent.pendingChildRequests });
    } catch (err) {
        console.log("ERROR getpendingreq called at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}

module.exports.cancelChildRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const parentId = req.parent._id;

        console.log(`Cancel request called: requestId=${requestId}, parentId=${parentId}`);

        // Get parent with pendingChildRequests
        const parent = await parentModel.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Find the request in parent's pendingChildRequests
        const request = parent.pendingChildRequests.find(
            req => req._id.toString() === requestId
        );

        if (!request) {
            console.log(`Request ${requestId} not found in parent's pending requests`);
            return res.status(404).json({ message: 'Request not found' });
        }

        const userId = request.userId;

        // Get user details
        const user = await userModel.findById(userId);
        if (!user) {
            console.log(`User ${userId} not found`);
        }

        // First remove from parent's pending requests
        const updatedParent = await parentModel.findByIdAndUpdate(
            parentId,
            { $pull: { pendingChildRequests: { _id: requestId } } },
            { new: true }
        );

        // Then remove from user's pending requests
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { pendingParentRequests: { parentId: parentId, status: 'pending' } } },
            { new: true }
        );

        console.log(`Removed request from parent ${parent.fullname?.firstname} to user ${user?.fullname?.firstname}`);
        console.log(`User ${user?.fullname?.firstname} now has ${updatedUser?.pendingParentRequests?.length || 0} pending requests`);

        // Notify user via room-based socket
        sendToUserRoom(userId, 'user', 'parent-request-cancelled', {
            requestId: requestId,
            parentId: parentId,
            parentName: `${parent.fullname?.firstname} ${parent.fullname?.lastname}`,
            userId: userId,
            timestamp: new Date()
        });

        res.status(200).json({ message: 'Request cancelled successfully' });
    } catch (err) {
        console.log("Error cancelling request at parent.controller.js:", err);
        res.status(500).json({ message: err.message });
    }
}

module.exports.addChild = async (req, res, next) => {
    try {
        const { requestId } = req.body;
        const parentId = req.parent._id;

        const parent = await parentModel.findById(parentId);
        const request = parent.pendingChildRequests.id(requestId);
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const childId = request.userId;
        const child = await userModel.findById(childId);

        // Update relationships
        const updatedParent = await parentService.addChildToParent(parentId, childId);
        const updatedUser = await userModel.findByIdAndUpdate(
            childId, 
            { parentId: parentId },
            { new: true }
        );

        // Clean up requests
        await parentModel.findByIdAndUpdate(parentId, {
            $pull: { pendingChildRequests: { _id: requestId } }
        });

        await userModel.findByIdAndUpdate(childId, {
            $pull: { pendingParentRequests: { parentId: parentId } }
        });

        // Notify parent via room
        sendToUserRoom(parentId, 'parent', 'parent-request-accepted-notification', {
            userId: childId,
            userName: `${child.fullname.firstname} ${child.fullname.lastname}`,
            requestId: requestId,
            timestamp: new Date()
        });
        
        // Also send children list update to parent
        sendToUserRoom(parentId, 'parent', 'children-list-updated', {
            type: 'child-added',
            userId: childId,
            userName: `${child.fullname.firstname} ${child.fullname.lastname}`,
            timestamp: new Date()
        });

        // Notify user via room
        sendToUserRoom(childId, 'user', 'parent-status-updated', {
            parentId: parentId,
            status: 'connected',
            hasParent: true,
            timestamp: new Date()
        });

        res.status(200).json({ 
            message: 'Child added successfully', 
            parent: updatedParent 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports.getChildLocation = async (req, res, next) => {
    try {
        const { childId } = req.params;
        const parentId = req.parent._id;

        const parent = await parentModel.findById(parentId);
        console.log(`getchildlocation called at parent.controller.js from parenthome.jsx, par=${parent.fullname.firstname}`)
        if (!parent.children.includes(childId)) {
            console.log("par Unauthorized as user is not your child at parent.controller.js");
            return res.status(403).json({ message: 'Unauthorized as user is not your child' });
        }

        const child = await userModel.findById(childId);

        const rideModel = require('../models/ride.model');
        // Get current ride information if any
        console.log(`user=${child.fullname.firstname} at parent.controller.js`);
        
        const currentRide = await rideModel.findOne({
            user: childId,
            status: { $in: ['accepted', 'ongoing'] }
        }).populate('captain', 'fullname vehicle location');

        console.log(`at parent.controller.js, child=${child.fullname.firstname}, ride=${currentRide?._id}`);
        
        res.status(200).json({ 
            currentRide: currentRide ? {
                rideId: currentRide._id,
                status: currentRide.status,
                captain: currentRide.captain ? {
                    name: `${currentRide.captain.fullname.firstname} ${currentRide.captain.fullname.lastname}`,
                    vehicle: currentRide.captain.vehicle,
                    location: currentRide.captain.location
                } : null,
                pickup: currentRide.pickup,
                destination: currentRide.destination,
                fare: currentRide.fare
            } : null
        });
    } catch (err) {
        console.log("err getting child location at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}

module.exports.getChildRides = async (req, res, next) => {
    const { userId } = req.params;
    console.log("getchildrides called at parent.controller.js, userId=", userId);
    
    const user = await userModel.findById(userId)
        .populate({
            path: "rideHistory",
            populate: {
                path: "captain"
            }
        });
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    
    console.log("getchildrides called at parent.controller.js by par for user=" + user.fullname.firstname);
    
    const rideHistory = user.rideHistory;
    return res.status(200).json({ rides: rideHistory });
}