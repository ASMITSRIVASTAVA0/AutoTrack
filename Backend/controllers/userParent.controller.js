const userModel = require('../models/user.model');
const parentModel = require('../models/parent.model');
const { validationResult } = require('express-validator');

// ADD THESE TO user.controller.js later ======================================

module.exports.getPendingParentRequests = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const user = await userModel.findById(userId)
            .populate('pendingParentRequests.parentId', 'fullname email profileImage');
        
        console.log(`getpendingparreq at userParentController.js, user=${user?.fullname?.firstname} and pendreq=${user?.pendingParentRequests?.length || 0}`);
        
        res.status(200).json({ 
            success: true,
            pendingRequests: user?.pendingParentRequests || [],
            count: user?.pendingParentRequests?.length || 0
        });
    } catch (err) {
        console.error('Error getting pending parent requests at userParentController.js:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch pending parent requests',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Update acceptParentRequest function in userParent.controller.js
module.exports.acceptParentRequest = async (req, res, next) => {
    try {
        console.log("acceptParentRequest called at userParentController.js");
        const { requestId } = req.params;
        const { parentId: bodyParentId } = req.body;
        const userId = req.user._id; // after auth.middleware, req.user is set

        console.log(`Params: requestId=${requestId}, body parentId=${bodyParentId}, userId=${userId}`);

        // Validate requestId
        if (!requestId || requestId === 'undefined') {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid request ID' 
            });
        }

        // Find user with pending requests
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const request = user.pendingParentRequests.id(requestId);
        
        console.log(`User=${user.fullname?.firstname}, found request:`, request);

        if (!request) {
            console.log("Request not found in user's pending requests");
            return res.status(404).json({ 
                success: false,
                message: 'Parent request not found' 
            });
        }

        // Use parentId from request if not provided in body
        const actualParentId = bodyParentId || request.parentId;
        
        if (!actualParentId) {
            return res.status(400).json({ 
                success: false,
                message: 'Parent ID is required' 
            });
        }

        // Verify parent exists
        const parentExists = await parentModel.findById(actualParentId);
        if (!parentExists) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        // Check if user already has a parent
        if (user.parentId) {
            return res.status(400).json({ 
                success: false,
                message: 'User already has a parent assigned' 
            });
        }

        // Use transaction-like pattern for atomic operations
        let updatedUser, updatedParent;
        
        try {
            // Remove the request from user's pending requests and set parentId
            updatedUser = await userModel.findByIdAndUpdate(
                userId, 
                {
                    parentId: actualParentId,
                    $pull: { pendingParentRequests: { _id: requestId } }
                },
                { new: true, runValidators: true }
            );

            // Add user to parent's children array
            updatedParent = await parentModel.findByIdAndUpdate(
                actualParentId,
                {
                    $addToSet: { children: userId },
                    $pull: { 
                        pendingChildRequests: { 
                            userId: userId.toString()
                        } 
                    }
                },
                { new: true, runValidators: true }
            );

        } catch (transactionError) {
            console.error('Transaction error:', transactionError);
            // Attempt to rollback
            if (updatedUser) {
                await userModel.findByIdAndUpdate(userId, {
                    parentId: null,
                    $addToSet: { pendingParentRequests: request }
                });
            }
            throw transactionError;
        }

        console.log(`User=${updatedUser.fullname?.firstname} accepted parent=${updatedParent.fullname?.firstname}`);
        console.log(`Parent children count: ${updatedParent.children?.length}`);
        console.log(`User parentId: ${updatedUser.parentId}`);

        // ✅ FIXED: Use sendToUserRoom from socket.js (correct import)
        const { sendToUserRoom } = require('../socket');
        
        // Notify parent via their room
        sendToUserRoom(actualParentId, 'parent', 'parent-request-accepted-notification', {
            userId: userId,
            userName: `${user.fullname?.firstname} ${user.fullname?.lastname}`,
            userEmail: user.email,
            timestamp: new Date(),
            requestId: requestId
        });
        
        // Also notify user about their new parent status
        sendToUserRoom(userId, 'user', 'parent-status-changed', {
            parentId: actualParentId,
            status: 'connected',
            hasParent: true,
            timestamp: new Date()
        });
        
        console.log("Parent request accepted at userParent.Controller.js");
        res.status(200).json({ 
            success: true,
            message: 'Parent request accepted successfully',
            parentId: actualParentId,
            user: {
                _id: updatedUser._id,
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                parentId: updatedUser.parentId
            },
            parent: {
                _id: updatedParent._id,
                fullname: updatedParent.fullname,
                email: updatedParent.email,
                childrenCount: updatedParent.children?.length
            }
        });
    } catch (err) {
        console.error('Error accepting parent request at userParent.controller.js:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to accept parent request',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports.rejectParentRequest = async (req, res, next) => {
    try {
        console.log("rejectParentRequest called at userParent.controller.js");
        const { requestId } = req.params;
        const { parentId: bodyParentId } = req.body;
        const userId = req.user._id;

        console.log(`Params: requestId=${requestId}, body parentId=${bodyParentId}, userId=${userId}`);

        // VALIDATION: Check if requestId exists
        if (!requestId || requestId === 'undefined') {
            console.log("Invalid requestId:", requestId);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid request ID' 
            });
        }

        // Find user to get the request details
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const request = user.pendingParentRequests.id(requestId);
        
        if (!request) {
            console.log("Request not found at userParent.controller.js");
            return res.status(404).json({ 
                success: false,
                message: 'Parent request not found' 
            });
        }

        // Use parentId from request if not provided in body
        const actualParentId = bodyParentId || request.parentId;
        
        if (!actualParentId) {
            return res.status(400).json({ 
                success: false,
                message: 'Parent ID is required' 
            });
        }

        // Verify parent exists
        const parentExists = await parentModel.findById(actualParentId);
        if (!parentExists) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        // Remove request from user
        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            {
                $pull: { pendingParentRequests: { _id: requestId } }
            },
            { new: true, runValidators: true }
        );

        // Remove request from parent
        const updatedParent = await parentModel.findByIdAndUpdate(
            actualParentId,
            {
                $pull: { 
                    pendingChildRequests: { 
                        userId: userId.toString()
                    } 
                }
            },
            { new: true, runValidators: true }
        );

        console.log(`Rejecting request by user=${updatedUser.fullname?.firstname} for parent=${updatedParent.fullname?.firstname}`);

        // ✅ FIXED: Use sendToUserRoom from socket.js (correct import)
        const { sendToUserRoom } = require('../socket');
        
        // Emit socket event to parent's room
        sendToUserRoom(actualParentId, 'parent', 'parent-request-rejected-notification', {
            userId: userId,
            userName: `${user.fullname?.firstname} ${user.fullname?.lastname}`,
            userEmail: user.email,
            requestId: requestId,
            timestamp: new Date()
        });
        
        res.status(200).json({ 
            success: true,
            message: 'Parent request rejected successfully',
            parentId: actualParentId,
            rejectedAt: new Date()
        });
    } catch (err) {
        console.error('Error rejecting parent request:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to reject parent request',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// New: Remove parent relationship
module.exports.removeParent = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { parentId } = req.body;

        if (!parentId) {
            return res.status(400).json({
                success: false,
                message: 'Parent ID is required'
            });
        }

        // Get user details before update
        const user = await userModel.findById(userId);
        
        // Update user to remove parentId
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { parentId: null },
            { new: true }
        );

        // Remove user from parent's children array
        const updatedParent = await parentModel.findByIdAndUpdate(
            parentId,
            { $pull: { children: userId } },
            { new: true }
        );

        // ✅ FIXED: Use sendToUserRoom from socket.js
        const { sendToUserRoom } = require('../socket');
        
        // Notify parent about relationship removal
        sendToUserRoom(parentId, 'parent', 'parent-removed', {
            parentId: parentId,
            userId: userId,
            userName: `${user.fullname?.firstname} ${user.fullname?.lastname}`,
            userEmail: user.email,
            timestamp: new Date()
        });
        
        // Notify user about removal
        sendToUserRoom(userId, 'user', 'parent-removed-success', {
            parentId: parentId,
            timestamp: new Date(),
            message: 'Parent successfully removed',
            hasParent: false
        });

        res.status(200).json({
            success: true,
            message: 'Parent relationship removed successfully',
            user: {
                _id: updatedUser._id,
                parentId: updatedUser.parentId
            }
        });
    } catch (err) {
        console.error('Error removing parent:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to remove parent relationship'
        });
    }
};

// New: Cancel a pending parent request (user cancels)
module.exports.cancelParentRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        // Find user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find the request
        const request = user.pendingParentRequests.id(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const parentId = request.parentId;

        // Remove request from user
        await userModel.findByIdAndUpdate(
            userId,
            { $pull: { pendingParentRequests: { _id: requestId } } }
        );

        // Remove request from parent
        await parentModel.findByIdAndUpdate(
            parentId,
            { $pull: { pendingChildRequests: { userId: userId.toString() } } }
        );

        // ✅ Use sendToUserRoom to notify parent
        const { sendToUserRoom } = require('../socket');
        
        // Notify parent about cancellation
        sendToUserRoom(parentId, 'parent', 'parent-request-cancelled', {
            userId: userId,
            requestId: requestId,
            parentId: parentId,
            parentName: `${user.fullname?.firstname} ${user.fullname?.lastname}`,
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Parent request cancelled successfully',
            cancelledAt: new Date()
        });
    } catch (err) {
        console.error('Error cancelling parent request:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel parent request'
        });
    }
};

// New: Get parent info (if user has parent)
module.exports.getParentInfo = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const user = await userModel.findById(userId)
            .populate('parentId', 'fullname email profileImage phone isOnline');
        
        if (!user.parentId) {
            return res.status(200).json({
                success: true,
                hasParent: false,
                message: 'No parent assigned'
            });
        }

        res.status(200).json({
            success: true,
            hasParent: true,
            parent: {
                _id: user.parentId._id,
                fullname: user.parentId.fullname,
                email: user.parentId.email,
                phone: user.parentId.phone,
                profileImage: user.parentId.profileImage,
                isOnline: user.parentId.isOnline
            }
        });
    } catch (err) {
        console.error('Error getting parent info:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to get parent information'
        });
    }
};