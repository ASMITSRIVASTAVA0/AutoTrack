// const rideService = require('../services/ride.service');
// const { validationResult } = require('express-validator');
// const mapService = require('../services/maps.service');
// const { sendMessageToSocketId } = require('../socket');
// const rideModel = require('../models/ride.model');


// module.exports.createRide = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const {  pickup, destination, vehicleType } = req.body;

//     try {
//         const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
//         console.log("ride created", ride);
//         res.status(201).json(ride);

//         const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
//         console.log("pickup coordinates", pickupCoordinates);


//         const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lng, 10);

//         ride.otp = ""

//         const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');
//         console.log("ride with user", rideWithUser);
//         captainsInRadius.map(captain => {
//             console.log("captain found", captain);
//             sendMessageToSocketId(captain.socketId, {
//                 event: 'new-ride',
//                 data: rideWithUser
//             })

//         })

//     } catch (err) {

//         console.log(err);
//         return res.status(500).json({ message: err.message });
//     }

// };

// module.exports.getFare = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const { pickup, destination } = req.query;

//     try {
//         const fare = await rideService.getFare(pickup, destination);
//         return res.status(200).json(fare);
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }

// module.exports.confirmRide = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const { rideId } = req.body;

//     try {
//         const ride = await rideService.confirmRide({ rideId, captain: req.captain });

//         sendMessageToSocketId(ride.user.socketId, {
//             event: 'ride-confirmed',
//             data: ride
//         })

//         return res.status(200).json(ride);
//     } catch (err) {

//         console.log(err);
//         return res.status(500).json({ message: err.message });
//     }
// }

// module.exports.startRide = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const { rideId, otp } = req.query;
//     console.log("Starting ride with rideId:", rideId, "and otp:", otp);

//     try {
//         const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

//         console.log(ride);

//         sendMessageToSocketId(ride.user.socketId, {
//             event: 'ride-started',
//             data: ride
//         })

//         return res.status(200).json(ride);
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }

// module.exports.endRide = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const { rideId } = req.body;
//     console.log("Ending ride with rideId:", rideId);

//     try {
//         const ride = await rideService.endRide({ rideId, captain: req.captain });
//         console.log(ride);
//         sendMessageToSocketId(ride.user.socketId, {
//             event: 'ride-ended',
//             data: ride
//         })



//         return res.status(200).json(ride);
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     } 
// }


const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        // Get coordinates for pickup and destination addresses
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup.address);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination.address);
        console.log("createRide() called at ride.controller.js");
        console.log("pickup coordinates", pickupCoordinates);
        console.log("destination coordinates", destinationCoordinates);
        console.log("user",req.user);
        console.log("userid="+req.user?._id);

        // Create ride with complete location data
        const ride = await rideService.createRide({ 
            user: req.user._id,
            pickup: {
                address: pickup.address,
                lat: pickupCoordinates.lat,
                lng: pickupCoordinates.lng
            }, 
            destination: {
                address: destination.address,
                lat: destinationCoordinates.lat,
                lng: destinationCoordinates.lng
            }, 
            vehicleType 
        });
        
        console.log("ride created", ride);

        // Find captains in radius
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.lat, 
            pickupCoordinates.lng, 
            500
        );

        // Populate ride with user data (excluding OTP for security)
        const rideWithUser = await rideModel.findOne({ _id: ride._id })
            .populate('user', '-password')
            .select('-otp'); // Don't send OTP to captains

        console.log("ride with user", rideWithUser);
        
        // Notify all available captains
        captainsInRadius.forEach(captain => {
            console.log("notifying captain", captain._id);
            if (captain.socketId) {
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideWithUser
                });
            }
        });

        // Send response to user (include OTP only for user)
        const userRideResponse = {
            ...rideWithUser.toObject(),
            otp: ride.otp // Include OTP only in user response
        };

        res.status(201).json({
            message: 'Ride created successfully',
            ride: userRideResponse
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        // Get coordinates for fare calculation
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination);

        const fare = await rideService.getFare(
            { 
                lat: pickupCoordinates.lat,  // ✅ Change 'ltd' to 'lat'
                lng: pickupCoordinates.lng 
            }, 
            { 
                lat: destinationCoordinates.lat,  // ✅ Change 'ltd' to 'lat'
                lng: destinationCoordinates.lng 
            }
        );
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain._id });

        // Populate ride data for sending to user
        const populatedRide = await rideModel.findById(rideId)
            .populate('user', 'fullname email socketId')
            .populate('captain', 'fullname vehicle socketId');

        if (populatedRide.user.socketId) {
            sendMessageToSocketId(populatedRide.user.socketId, {
                event: 'ride-confirmed',
                data: {
                    rideId: populatedRide._id,
                    captain: {
                        name: populatedRide.captain.fullname,
                        vehicle: populatedRide.captain.vehicle
                    },
                    status: populatedRide.status
                }
            });
        }

        return res.status(200).json({
            message: 'Ride confirmed successfully',
            ride: populatedRide
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

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
            .populate('user', 'fullname email socketId')
            .populate('captain', 'fullname vehicle');

        console.log("Ride started:", populatedRide);

        if (populatedRide.user.socketId) {
            sendMessageToSocketId(populatedRide.user.socketId, {
                event: 'ride-started',
                data: {
                    rideId: populatedRide._id,
                    captain: {
                        name: populatedRide.captain.fullname,
                        vehicle: populatedRide.captain.vehicle
                    },
                    status: populatedRide.status,
                    startedAt: populatedRide.startedAt // if you have this field
                }
            });
        }

        return res.status(200).json({
            message: 'Ride started successfully',
            ride: populatedRide
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

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
            .populate('user', 'fullname email socketId')
            .populate('captain', 'fullname vehicle');

        console.log("Ride ended:", populatedRide);

        if (populatedRide.user.socketId) {
            sendMessageToSocketId(populatedRide.user.socketId, {
                event: 'ride-ended',
                data: {
                    rideId: populatedRide._id,
                    fare: populatedRide.fare,
                    distance: populatedRide.distance,
                    duration: populatedRide.duration,
                    status: populatedRide.status,
                    endedAt: populatedRide.endedAt // if you have this field
                }
            });
        }

        return res.status(200).json({
            message: 'Ride ended successfully',
            ride: populatedRide
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

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
}