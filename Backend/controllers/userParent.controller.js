const userModel = require('../models/user.model');
const parentModel = require('../models/parent.model');
const { validationResult } = require('express-validator');

module.exports.getPendingParentRequests = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const user = await userModel.findById(userId)
            .populate('pendingParentRequests.parentId', 'fullname email');
        
        console.log(`getpendingparreq at userParentController.js, user=${user.fullname.firstname} and pendreq=${user.pendingParentRequests}`);
        res.status(200).json({ 
            pendingRequests: user.pendingParentRequests || [] 
        });
    } catch (err) {
        console.error('Error getting pending parent requests at userParentController.js:', err);
        res.status(500).json({ message: err.message });
    }
}

module.exports.acceptParentRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        // Find user and the specific request
        const user = await userModel.findById(userId);
        const request = user.pendingParentRequests.id(requestId);
        
        console.log(`acceptparreq called, user=${user.fullname.firstname}, reqid=${request}`);

        if (!request) {
            console.log("req not found");
            return res.status(404).json({ message: 'Request not found' });
        }

        const parentId = request.parentId;

        // Update user with parent reference
        const updatedUser=await userModel.findByIdAndUpdate(userId, {
            parentId: parentId,
            $pull: { pendingParentRequests: { _id: requestId } }
        });

        // Update parent with child reference
        const updatedParent=await parentModel.findByIdAndUpdate(parentId, {
            $addToSet: { children: userId },
            $pull: { 
                pendingChildRequests: { 
                    userId: userId,
                    status: 'pending'
                } 
            }
        });

        console.log(`user=${updatedUser.fullname.firstname} going to accept par=${updatedParent.fullname.firstname}`);

        // Notify parent via socket
        const { sendMessageToSocketId } = require('../socket');
        const parent = await parentModel.findById(parentId);
        if (parent && parent.socketId) {
            sendMessageToSocketId(parent.socketId, {
                event: 'parent-request-accepted',
                data: {
                    userId: userId,
                    userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                    timestamp: new Date()
                }
            });
        }
        console.log("par req accepted at userParent.Controller.js");
        res.status(200).json({ message: 'Parent request accepted successfully' });
    } catch (err) {
        console.error('Error accepting parent request  at userParent.controller.js');
        res.status(500).json({ message: err.message });
    }
}

module.exports.rejectParentRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        // Remove request from user
        await userModel.findByIdAndUpdate(userId, {
            $pull: { pendingParentRequests: { _id: requestId } }
        });

        // Remove request from parent
        const user = await userModel.findById(userId);
        const request = user.pendingParentRequests.id(requestId);
        
        console.log(`reqparreq called at userParent.controller.js, user=${user.fullname.firstname}, reqid=${request._id}`);
        if (request) {
            await parentModel.findByIdAndUpdate(request.parentId, {
                $pull: { 
                    pendingChildRequests: { 
                        userId: userId,
                        status: 'pending'
                    } 
                }
            });
        }

        res.status(200).json({ message: 'Parent request rejected successfully' });
    } catch (err) {
        console.error('Error rejecting parent request:', err);
        res.status(500).json({ message: err.message });
    }
}