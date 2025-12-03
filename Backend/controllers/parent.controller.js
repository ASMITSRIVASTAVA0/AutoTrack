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

    const token = parent.generateAuthToken();

    res.cookie('token', token);

    res.status(201).json({ token, parent });
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

    const token = parent.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, parent });
}

module.exports.logoutParent = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        await blackListTokenModel.create({ token: token });

        res.clearCookie('token');
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
        console.log("getparprofile called at parent.controller.js");
        res.status(200).json({ parent });
    } catch (err) {
        console.log("error at getparprofile called at parent.controller.js");
        res.status(500).json({ message: err.message });
    }
}


module.exports.sendChildRequest = async (req, res, next) => {
    try {
        const { userEmail } = req.body;
        const parentId = req.parent?._id; // Add optional chaining

        console.log("sendChildRequest called at controller.js");
        console.log("at parent.controller.js, child email="+userEmail+" parid="+parentId);

        // Check if parent is authenticated
        if (!parentId) {
            console.log("par not authenticated at parent.controller.js");
            return res.status(401).json({ message: 'Parent not authenticated' });
        }

        // Find user by email
        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            console.log("user not found with useremail="+userEmail);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("Found user at controller.js : ", user.fullname.firstname);

        // Check if user is already a child
        if (user.parentId && user.parentId.toString() === parentId.toString()) {
            console.log(`${user.fullname.firstname} is already child of ${parentId} at parent.controller.js`);
            return res.status(400).json({ message: 'User is already your child' });
        }

        // Check if request already exists
        const existingRequest = user.pendingParentRequests?.find(
            req => req.parentId.toString() === parentId.toString() && req.status === 'pending'
        );
        
        if (existingRequest) {
            console.log("req already send to user");
            return res.status(400).json({ message: 'Request already sent to this user' });
        }

        const parent = await parentModel.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Add request to user
        const userupdated=await userModel.findByIdAndUpdate(user._id, {
            $push: {
                pendingParentRequests: {
                    parentId: parentId,
                    parentName: `${parent.fullname.firstname} ${parent.fullname.lastname}`,
                    status: 'pending'
                }
            }
        });
        console.log("Updated user pending req list at controller.js : ", userupdated.pendingParentRequests);

        // Add request to parent
        const updatedParent=await parentModel.findByIdAndUpdate(parentId, {
            $push: {
                pendingChildRequests: {
                    userId: user._id,
                    userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                    status: 'pending'
                }
            }
        });
        console.log("Updated parent child req at controller.js : ", updatedParent.pendingChildRequests);

        // Notify user via socket if online
        const { sendMessageToSocketId } = require('../socket');
        if (user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'parent-request-received',
                data: {
                    parentId: parentId,
                    parentName: `${parent.fullname.firstname} ${parent.fullname.lastname}`,
                    requestId: user.pendingParentRequests[user.pendingParentRequests.length - 1]._id
                }
            });
        }

        res.status(200).json({ message: 'Child request sent successfully' });
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

module.exports.cancelChildRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const parentId = req.parent._id;

        // Remove from parent's pending requests
        const parent=await parentModel.findByIdAndUpdate(parentId, {
            $pull: { pendingChildRequests: { _id: requestId } }
        });

        // Remove from user's pending requests
        const user=await userModel.updateOne(
            { 'pendingParentRequests._id': requestId },
            { $pull: { pendingParentRequests: { _id: requestId } } }
        );
        console.log(`cancel req called at parent.controller.js, par=${parent.fullname.firstname}, user=${user.fullname.firstname}`);

        res.status(200).json({ message: 'Request cancelled successfully' });
    } catch (err) {
        console.log("err cancelling req at parent.controller.js");
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
