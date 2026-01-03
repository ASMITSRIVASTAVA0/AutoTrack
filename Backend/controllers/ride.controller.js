// ride.controller.js
const rideService = require('../services/ride.service');
const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator');
const rideModel = require('../models/ride.model');
const parentModel = require('../models/parent.model');
const userModel = require('../models/user.model');



// Import room-based socket methods
const { sendToUserRoom, broadcastToUserType } = require('../socket');


module.exports.getFare = async (req, res) => {
    console.log("getFare() called at ride.controller.js");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;//as passed in params of request from frontend(controller.user/userideManagement.js)
    console.log("from req.body pickup address:", pickup, "destination:", destination);

    try {
        // Get coordinates for fare calculation
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination);
        console.log(`pickup coordinates, ${pickupCoordinates} destination coordinates: ${destinationCoordinates}`);
        const fare = await rideService.getFare(
            {
                lat: pickupCoordinates.lat,
                lng: pickupCoordinates.lng
            },
            {
                lat: destinationCoordinates.lat,
                lng: destinationCoordinates.lng
            }
        );
        
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};



// 1)create ride using rideservice,
// 2) find captain in radius using mapservice, 
// 3) notify captain using socket
module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType,fare } = req.body;//req.body filed at controller.user/useRideManagement.js


    try {
        // 1)create ride using rideservice,===============================================================================================
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup.address);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination.address);

        console.log("createRide() called at ride.controller.js, pickup coords=" + 
                   JSON.stringify(pickupCoordinates) + 
                   " dest coords=" + 
                   JSON.stringify(destinationCoordinates) + 
                   " userid=" + req.user._id);

        if(!pickupCoordinates||!destinationCoordinates){
            console.log("missing lat or lng of pick or dest");
            throw new Error("at ride.service.js, missing lat or lng of pickup or destination");
        }
        

        const rideData = {
            user: req.user._id,
            pickup: {
                address: pickup.address,
                location: {
                    type: 'Point',
                    coordinates: [pickupCoordinates.lng, pickupCoordinates.lat] // Note: [lng, lat]
                }
            },
            destination: {
                address: destination.address,
                location: {
                    type: 'Point',
                    coordinates: [destinationCoordinates.lng, destinationCoordinates.lat] // Note: [lng, lat]
                }
            },
            vehicleType: vehicleType,
            status: "pending",
            fare: fare,
            otp: getOtp(6),
        };

        // Create ride without populate
        const ride = await rideModel.create(rideData);

        console.log("ride created, rideid=" + ride._id);


        // 2)=================================================================================================================================
        // Find captains in radius
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.lat,
            pickupCoordinates.lng,
            500 // km
        );

        // // Populate ride with user data (excluding OTP for security)
        const rideWithUser = await rideModel.findOne({ _id: ride._id })
            .populate('user', '-password')
            .select('-otp');


        // Notify all available captains using room-based system
        captainsInRadius.forEach(captain => {
            console.log("notifying captain", captain._id);
            // Send to captain's personal room
            // sendToUserRoom(captain._id, 'captain', 'new-ride', rideWithUser);
            sendToUserRoom(captain._id, 'captain', 'new-ride', rideWithUser);
        });

        // // Also broadcast to all captains for redundancy
        // broadcastToUserType('captain', 'ride-available', {
        //     message: 'New ride available in your area',
        //     rideCount: 1,
        //     area: pickup.address
        // });



        // Send response to user (include OTP only for user)
        const rideWithOtp = {
            ...rideWithUser.toObject(),
            otp: ride.otp // Include OTP only in user response
        };

        res.status(201).json({
            message: 'Ride created successfully',
            ride: rideWithOtp
        });


    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

const crypto = require('crypto');
function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}


module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {


        // make status=accepted, give captainid, populated with user,captain,OTP
        const populatedRide = await rideService.confirmRide({ rideId, captain: req.captain._id });

        if(!populatedRide){
            console.log("at ride.controller.js, populatedRide is null");
            return res.status(404).json({ message: 'Ride not Confirmed' });
        }

        

        // Notify user via room
        sendToUserRoom(populatedRide.user._id, 'user', 'ride-confirmed', {
            rideId: populatedRide._id,
            ride: populatedRide,
            captain: {
                name: `${populatedRide.captain.fullname.firstname} ${populatedRide.captain.fullname.lastname}`,
                vehicle: populatedRide.captain.vehicle
            },
            status: populatedRide.status
        });

        // Notify parent if user has one via room
        if (populatedRide.user.parentId) {
            const parent = await parentModel.findById(populatedRide.user.parentId);
            if (parent) {
                // Send to parent's room for notification
                sendToUserRoom(parent._id, 'parent', 'childride-accepted-notifyPar', {
                    userId: populatedRide.user._id,
                    rideId: populatedRide._id,
                    captainId: populatedRide.captain._id,
                    captainLocation: populatedRide.captain.location,
                    captainName: `${populatedRide.captain.fullname.firstname} ${populatedRide.captain.fullname.lastname}`,
                    message: `A ride for your child ${populatedRide.user.fullname.firstname} has been accepted by Captain: ${populatedRide.captain.fullname.firstname}`,
                    timestamp: new Date(),
                    read: false
                });

                // Also send ride details for tracking to parent's room
                sendToUserRoom(parent._id, 'parent', 'child-ride-started', {
                    childId: populatedRide.user._id,
                    childName: `${populatedRide.user.fullname.firstname} ${populatedRide.user.fullname.lastname}`,
                    ride: populatedRide,
                    timestamp: new Date()
                });
            }
        }

        return res.status(200).json({
            message: 'Ride confirmed successfully',
            ride: populatedRide
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;
    console.log("Starting ride with rideId:", rideId, "and otp:", otp);

    try {
        // only update ride status(ongoing) and startedAt
        const ride = await rideService.startRide({
            rideId,
            otp,
            captain: req.captain._id
        });

        // Populate ride data for sending to user
        const populatedRide = await rideModel.findById(rideId)
            .populate('user', 'fullname email parentId')
            .populate('captain', 'fullname vehicle location');

        console.log("Ride started:", populatedRide);

        // Notify user via room
        sendToUserRoom(populatedRide.user._id, 'user', 'ride-started', {
            rideId: populatedRide._id,
            ride: populatedRide,
            captain: {
                name: `${populatedRide.captain.fullname.firstname} ${populatedRide.captain.fullname.lastname}`,
                vehicle: populatedRide.captain.vehicle
            },
            status: populatedRide.status,
            startedAt: populatedRide.startedAt
        });

        // Notify parent if user has one via room
        if (populatedRide.user.parentId) {
            sendToUserRoom(populatedRide.user.parentId, 'parent', 'child-ride-ongoing', {
                userModelId: populatedRide.user._id,
                userName: `${populatedRide.user.fullname.firstname} ${populatedRide.user.fullname.lastname}`,
                rideId: populatedRide._id,
                captain: {
                    name: `${populatedRide.captain.fullname.firstname} ${populatedRide.captain.fullname.lastname}`,
                    vehicle: populatedRide.captain.vehicle,
                    location: populatedRide.captain.location
                },
                startedAt: new Date(),
                timestamp: new Date()
            });
        }

        return res.status(200).json({
            message: 'Ride started successfully',
            ride: populatedRide
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
    console.log("Ending ride with rideId:", rideId);

    try {
        const ride = await rideService.endRide({
            rideId,
            captain: req.captain._id
        });

        // Populate ride data for sending to user
        const populatedRide = await rideModel.findById(rideId)
            .populate('user', 'fullname email parentId')
            .populate('captain', 'fullname vehicle');

        console.log("Ride ended:", populatedRide);

        // Add ride to user's ride history
        const userWithRide = await userModel.findByIdAndUpdate(
            populatedRide.user._id,
            { $push: { rideHistory: populatedRide._id } },
            { new: true }
        );

        console.log("updated user with ride history:", userWithRide);

        // Notify user via room
        sendToUserRoom(populatedRide.user._id, 'user', 'ride-ended', {
            rideId: populatedRide._id,
            fare: populatedRide.fare,
            distance: populatedRide.distance,
            duration: populatedRide.duration,
            status: populatedRide.status,
            endedAt: populatedRide.endedAt
        });

        // Notify parent if user has one via room
        if (populatedRide.user.parentId) {
            sendToUserRoom(populatedRide.user.parentId, 'parent', 'child-ride-ended', {
                userId: populatedRide.user._id,
                userName: `${populatedRide.user.fullname.firstname} ${populatedRide.user.fullname.lastname}`,
                rideId: populatedRide._id,
                fare: populatedRide.fare,
                distance: populatedRide.distance,
                endedAt: new Date(),
                timestamp: new Date()
            });
        }

        return res.status(200).json({
            message: 'Ride ended successfully',
            ride: populatedRide
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Additional helper method to get ride details
module.exports.getRideDetails = async (req, res) => {
    const { rideId } = req.params;

    try {
        const ride = await rideModel.findById(rideId)
            .populate('user', 'fullname email')
            .populate('captain', 'fullname vehicle')
            .select('-otp'); // Exclude OTP for security

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        return res.status(200).json({ ride });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// New: Get current ride for a user
module.exports.getCurrentRide = async (req, res) => {
    try {
        const currentRide = await rideModel.findOne({
            user: req.user._id,
            status: { $in: ['accepted', 'ongoing'] }
        })
            .populate('captain', 'fullname vehicle location')
            .populate('user', 'fullname email parentId');

        if (!currentRide) {
            return res.status(404).json({ message: 'No active ride found' });
        }

        return res.status(200).json({ ride: currentRide });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// New: Cancel ride
module.exports.cancelRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideModel.findById(rideId);
        
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if user is authorized to cancel
        if (ride.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this ride' });
        }

        // Only allow cancellation if ride is pending or accepted
        if (!['pending', 'accepted'].includes(ride.status)) {
            return res.status(400).json({ message: 'Ride cannot be cancelled at this stage' });
        }

        // Update ride status
        ride.status = 'cancelled';
        ride.cancelledAt = new Date();
        await ride.save();

        // Notify captain if ride was accepted
        if (ride.captain) {
            const populatedRide = await rideModel.findById(rideId)
                .populate('user', 'fullname email')
                .populate('captain', 'fullname');
                
            sendToUserRoom(populatedRide.captain._id, 'captain', 'ride-cancelled', {
                rideId: populatedRide._id,
                userId: populatedRide.user._id,
                userName: `${populatedRide.user.fullname.firstname} ${populatedRide.user.fullname.lastname}`,
                reason: 'User cancelled the ride',
                timestamp: new Date()
            });
        }

        // Notify parent if user has one
        const user = await userModel.findById(ride.user);
        if (user && user.parentId) {
            sendToUserRoom(user.parentId, 'parent', 'child-ride-cancelled', {
                userId: user._id,
                userName: `${user.fullname.firstname} ${user.fullname.lastname}`,
                rideId: ride._id,
                timestamp: new Date(),
                message: `${user.fullname.firstname} cancelled a ride`
            });
        }

        return res.status(200).json({
            message: 'Ride cancelled successfully',
            ride
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};