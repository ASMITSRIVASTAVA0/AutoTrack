const parentModel = require('../models/parent.model');
const userModel = require('../models/user.model');
const blackListTokenModel = require('../models/blacklistToken.model');


const parentService = require('../services/parent.service');


const { validationResult } = require('express-validator');

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
            .populate('children')
            // .populate("pendingChildRequests")//mycode
            ;
        console.log("getparprofile called at parent.controller.js");
        res.status(200).json({ parent });
    } catch (err) {
        console.log("error at getparprofile called at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}


// Update sendChildRequest function in parent.controller.js
module.exports.sendChildRequest = async (req, res, next) => {
    try {
        const { userEmail } = req.body;
        const parentId = req.parent?._id;

        console.log("sendChildRequest called at parent.controller.js, child email=" + userEmail + " parid=" + parentId);

        if (!parentId) {
            console.log("par not authenticated at parent.controller.js");
            return res.status(401).json({ message: 'Parent not authenticated' });
        }

        // Find user with populated pendingParentRequests
        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            console.log("user not found with useremail=" + userEmail);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("Found user at controller.js : ", user.fullname.firstname);

        // Check if user is already a child
        if (user.parentId && user.parentId.toString() === parentId.toString()) {
            console.log(`${user.fullname.firstname} is already child of ${parentId} at parent.controller.js`);
            return res.status(400).json({ message: 'User is already your child' });
        } else if (user.parentId) {
            console.log(`${user.fullname.firstname} can only have one par, and par is ${user.parentId}`);
            return res.status(400).json({ message: "User already has a parent" });
        }

        // Check if request already exists - ENHANCED CHECK
        const existingRequest = user.pendingParentRequests?.find(
            req => req.parentId.toString() === parentId.toString() && req.status === 'pending'
        );
        
        if (existingRequest) {
            console.log("Request already sent to this user - checking if it might be stale...");
            
            // Check if the request is older than a certain time (e.g., 1 hour)
            const requestAge = Date.now() - new Date(existingRequest.requestedAt).getTime();
            const ONE_HOUR = 60 * 60 * 1000;
            
            if (requestAge > ONE_HOUR) {
                console.log("Stale request found (older than 1 hour), cleaning up...");
                
                // Clean up the stale request from user
                await userModel.findByIdAndUpdate(user._id, {
                    $pull: { pendingParentRequests: { _id: existingRequest._id } }
                });
                
                // Clean up from parent too
                await parentModel.findByIdAndUpdate(parentId, {
                    $pull: { pendingChildRequests: { userId: user._id } }
                });
                
                console.log("Cleaned up stale request, allowing new request");
                // Continue to send new request
            } else {
                console.log("Active pending request exists");
                return res.status(400).json({ message: 'Request already sent to this user' });
            }
        }

        const parent = await parentModel.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Create request for user
        const userRequest = {
            parentId: parentId,
            parentName: `${parent.fullname.firstname} ${parent.fullname.lastname}`,
            status: 'pending',
            requestedAt: new Date()
        };

        // Add request to user
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            { $push: { pendingParentRequests: userRequest } },
            { new: true }
        );

        // Create request for parent
        const parentRequest = {
            userId: user._id,
            userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
            status: 'pending',
            requestedAt: new Date()
        };

        // Add request to parent
        const updatedParent = await parentModel.findByIdAndUpdate(
            parentId,
            { $push: { pendingChildRequests: parentRequest } },
            { new: true }
        );

        // Get the newly created request ID from user
        const userWithNewReq = await userModel.findById(user._id);
        const newlyCreatedRequest = userWithNewReq.pendingParentRequests.find(
            req => req.parentId.toString() === parentId.toString() && req.status === "pending"
        );

        console.log(`New request created for user ${user.fullname.firstname} by parent ${parent.fullname.firstname}`);
        console.log(`User pending requests count: ${userWithNewReq.pendingParentRequests.length}`);

        res.status(200).json({
            message: 'Child request sent successfully',
            requestId: newlyCreatedRequest ? newlyCreatedRequest._id : null
        });
    } catch (err) {
        console.error('Error in sendChildRequest:', err);
        res.status(500).json({ message: err.message });
    }
}

module.exports.removeChild = async (req, res, next) => {
    try {
        const { childId } = req.params;
        const parentId = req.parent._id;
        const updatedParent = await parentService.removeChildFromParent(parentId, childId);

        // Remove parent reference from child
        const user=await userModel.findByIdAndUpdate(childId, { parentId: null });
        console.log(`removechild at parent.controller.js with childname=${child.fullname.firstname} and parname=${updatedParent.fullname.firstname}`);
        
        res.status(200).json({ message: 'Child removed successfully', parent: updatedParent });
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
        console.log("getpendingreq called at parent.controller.js");
        res.status(200).json({ requests: parent.pendingChildRequests });
    } catch (err) {
        console.log("ERROR getpendingreq called at parent.controller.js");
        
        res.status(500).json({ message: err.message });
    }
}

// In parent.controller.js, update the cancelChildRequest function:
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
        // We need to find the corresponding request in user's array
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { pendingParentRequests: { parentId: parentId, status: 'pending' } } },
            { new: true }
        );

        console.log(`Removed request from parent ${parent.fullname?.firstname} to user ${user?.fullname?.firstname}`);
        console.log(`User ${user?.fullname?.firstname} now has ${updatedUser?.pendingParentRequests?.length || 0} pending requests`);

        // Notify user via socket
        const { sendMessageToSocketId } = require('../socket');
        
        // If user is online, send socket notification
        if (user && user.socketId) {
            console.log(`Sending socket msg to user=${user.fullname?.firstname} having socketId=${user.socketId}`);
            
            sendMessageToSocketId(user.socketId, {
                event: 'parent-request-cancelled',
                data: {
                    requestId: requestId,
                    parentId: parentId,
                    parentName: `${parent.fullname?.firstname} ${parent.fullname?.lastname}`,
                    userId: userId,
                    timestamp: new Date()
                }
            });
        }

        res.status(200).json({ message: 'Request cancelled successfully' });
    } catch (err) {
        console.log("Error cancelling request at parent.controller.js:", err);
        res.status(500).json({ message: err.message });
    }
}

// Update addChild to handle request acceptance
module.exports.addChild = async (req, res, next) => {
    try {
        const { requestId } = req.body; // Now accepting requestId instead of childId
        const parentId = req.parent._id;

        // Find the request
        const parent = await parentModel.findById(parentId);
        const request = parent.pendingChildRequests.id(requestId);
        
        console.log(`add child called at parent.controller.js, par=${parent.fullname.firstname}, req=${request}`);
        if (!request) {
            console.log("req not found at addchild in parent.controller.js");
            return res.status(404).json({ message: 'Request not found' });
        }

        const childId = request.userId;

        const child = await userModel.findById(childId);
        console.log(`child=${child.fullname.firstname} at parent.controller.js`);
        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        // Update parent-child relationship
        const updatedParent = await parentService.addChildToParent(parentId, childId);
        const updatedUser=await userModel.findByIdAndUpdate(childId, { parentId: parentId });//sayad override prev par with new par id
        console.log(`user=${user.fullname.firstname} new par=${updatedParent.fullname.firstname}`);
        // Remove from pending requests
        await parentModel.findByIdAndUpdate(parentId, {
            $pull: { pendingChildRequests: { _id: requestId } }
        });

        await userModel.findByIdAndUpdate(childId, {
            $pull: { pendingParentRequests: { parentId: parentId } }
        });

        res.status(200).json({ message: 'Child added successfully', parent: updatedParent });
    } catch (err) {
        console.log("ERROR adding child at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}

// Update getChildLocation to include ride information
module.exports.getChildLocation = async (req, res, next) => {
    try {
        const { childId } = req.params;
        const parentId = req.parent._id;

        const parent = await parentModel.findById(parentId);
        console.log(`getchild called at parent.controller.js, par=${parent.fullname.firstname}`)
        if (!parent.children.includes(childId)) {
            console.log("par Unauthorized as user is not your child at parent.controller.js");
            return res.status(403).json({ message: 'Unauthorized as user is not your child' });
        }

        const child = await userModel.findById(childId);
        const rideModel = require('../models/ride.model');
        
        // Get current ride information if any
        const currentRide = await rideModel.findOne({
            user: childId,
            status: { $in: ['accepted', 'ongoing'] }
        }).populate('captain', 'fullname vehicle location');

        console.log(`at parent.controller.js, child=${child.fullname.firstname}, ride=${currentride._id}`);
        res.status(200).json({ 
            location: child.location,
            currentRide: currentRide ? {
                rideId: currentRide._id,
                status: currentRide.status,
                captain: currentRide.captain ? {
                    name: `${currentRide.captain.fullname.firstname} ${currentRide.captain.fullname.lastname}`,
                    vehicle: currentRide.captain.vehicle,
                    location: currentRide.captain.location
                } : null,
                pickup: currentRide.pickup,
                destination: currentRide.destination
            } : null
        });
    } catch (err) {
        console.log("err getting child location at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}

module.exports.getChildRides=async(req,res,next)=>{
    console.log("getchildrides called at parent.controller.js");
    const {userId}=req.params;
    const parentId=req.parent._id;

    const user=await userModel.findById(userId).populate("rideHistory");

    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const rideHistory=user.rideHistory;
    console.log(`rideHistory of user=${user.fullname.firstname} is ${rideHistory}`);
    return res.status(200).json({rides:rideHistory});
}