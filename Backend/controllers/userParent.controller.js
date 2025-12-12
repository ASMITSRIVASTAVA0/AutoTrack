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
            // pendingParentRequests: user.pendingParentRequests || []
        });
    } catch (err) {
        console.error('Error getting pending parent requests at userParentController.js:', err);
        res.status(500).json({ message: err.message });
    }
}
// Update acceptParentRequest function in userParent.controller.js
module.exports.acceptParentRequest = async (req, res, next) => {
    try {
        console.log("acceptParentRequest called at userParentController.js");
        const { requestId } = req.params;
        const { parentId } = req.body;
        const userId = req.user._id;//after auth.middleware, req.user set set hua

        console.log(`Params: requestId=${requestId}, body parentId=${parentId}, userId=${userId}`);

        // Find user
        const user = await userModel.findById(userId);
        const request = user.pendingParentRequests.id(requestId);
        
        console.log(`User=${user.fullname.firstname}, found request:`, request);

        if (!request) {
            console.log("Request not found in user's pending requests");
            return res.status(404).json({ message: 'Request not found' });
        }

        // Use parentId from request if not provided in body
        const actualParentId = parentId || request.parentId;

        // First, remove the request from user's pending requests
        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            {
                parentId: actualParentId,
                $pull: { pendingParentRequests: { _id: requestId } }
            },
            { new: true }
        );

        // Add user to parent's children array
        const updatedParent = await parentModel.findByIdAndUpdate(
            actualParentId,
            {
                $addToSet: { children: userId },  // Use $addToSet to avoid duplicates
                $pull: { 
                    pendingChildRequests: { 
                        userId: userId
                    } 
                }
            },
            { new: true }
        );

        console.log(`User=${updatedUser.fullname.firstname} accepted parent=${updatedParent.fullname.firstname}`);
        console.log(`Parent children: ${updatedParent.children}`);
        console.log(`User parentId: ${updatedUser.parentId}`);

        // Notify parent via socket
        const { sendMessageToSocketId } = require('../socket');
        const parent = await parentModel.findById(actualParentId);
        if (parent && parent.socketId) {
            sendMessageToSocketId(parent.socketId, {
                event: 'parent-request-accepted-notification',
                data: {
                    userId: userId,
                    userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                    userEmail: user.email,
                    timestamp: new Date()
                }
            });
        }
        
        console.log("Parent request accepted at userParent.Controller.js");
        res.status(200).json({ 
            message: 'Parent request accepted successfully',
            parentId: actualParentId,
            user: updatedUser,
            parent: updatedParent
        });
    } catch (err) {
        console.error('Error accepting parent request at userParent.controller.js:', err);
        res.status(500).json({ message: err.message });
    }
}

// module.exports.rejectParentRequest = async (req, res, next) => {
//     try {
//         console.log("rejectParentRequest called at userParent.controller.js");
//         const { requestId } = req.params;
//         const { parentId } = req.body; // Get parentId from body
//         const userId = req.user._id;

//         console.log(`Params: requestId=${requestId}, body parentId=${parentId}, userId=${userId}`);

//         // Find user to get the request details
//         const user = await userModel.findById(userId);
//         const request = user.pendingParentRequests.id(requestId);
        
//         if (!request) {
//             console.log("Request not found");
//             return res.status(404).json({ message: 'Request not found' });
//         }

//         // Use parentId from request if not provided in body
//         const actualParentId = parentId || request.parentId;

        
//         // Remove request from user
//         const updatedUser=await userModel.findByIdAndUpdate(
//             userId, 
//             {
//                 $pull: { pendingParentRequests: { _id: requestId } }
//             }
//         );

//         // Remove request from parent
//         const updatedParent=await parentModel.findByIdAndUpdate(
//             actualParentId,
//             {
//                 $pull: { 
//                     pendingChildRequests: { 
//                         userId: userId,
//                         status: 'pending'
//                     } 
//                 }
//             }
//         );

//         console.log(`Rejecting request by user=${updatedUser.fullname.firstname} for par=${updatedParent.fullname.firstname}, user pendingparreq=${updatedUser.pend} par pendingchindreq=${updatedParent.pendingChildRequests} requestId=${requestId}`);


//         res.status(200).json({ 
//             message: 'Parent request rejected successfully',
//             parentId: actualParentId 
//         });
//     } catch (err) {
//         console.error('Error rejecting parent request:', err);
//         res.status(500).json({ message: err.message });
//     }
// }

module.exports.rejectParentRequest = async (req, res, next) => {
    try {
        console.log("rejectParentRequest called at userParent.controller.js");
        const { requestId } = req.params;
        const { parentId } = req.body; // Get parentId from body
        const userId = req.user._id;

        console.log(`Params: requestId=${requestId}, body parentId=${parentId}, userId=${userId}`);

        // Find user to get the request details
        const user = await userModel.findById(userId);
        const request = user.pendingParentRequests.id(requestId);
        
        if (!request) {
            console.log("Request not found");
            return res.status(404).json({ message: 'Request not found' });
        }

        // Use parentId from request if not provided in body
        const actualParentId = parentId || request.parentId;

        // Remove request from user
        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            {
                $pull: { pendingParentRequests: { _id: requestId } }
            },
            { new: true }
        );

        // Remove request from parent
        const updatedParent = await parentModel.findByIdAndUpdate(
            actualParentId,
            {
                $pull: { 
                    pendingChildRequests: { 
                        userId: userId,
                        status: 'pending'
                    } 
                }
            },
            { new: true }
        );

        console.log(`Rejecting request by user=${updatedUser.fullname.firstname} for par=${updatedParent.fullname.firstname}`);

        // ✅ FIX: Emit socket event to parent
        const { sendMessageToSocketId } = require('../socket');
        const parent = await parentModel.findById(actualParentId);
        if (parent && parent.socketId) {
            sendMessageToSocketId(parent.socketId, {
                event: 'parent-request-rejected-notification',
                data: {
                    userId: userId,
                    userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                    requestId: requestId,
                    timestamp: new Date()
                }
            });
        }
        
        res.status(200).json({ 
            message: 'Parent request rejected successfully',
            parentId: actualParentId 
        });
    } catch (err) {
        console.error('Error rejecting parent request:', err);
        res.status(500).json({ message: err.message });
    }
}