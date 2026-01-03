const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
// const bcrypt = require('bcrypt');
// const crypto = require('crypto');

async function getFare(pickup, destination) {
    console.log("getFare at ride.service.js called with pickup coords:", pickup, "destination:", destination);    
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    // ONLY FETCH DISTANCE NOT TIME=========================================================================================



    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    
    const baseFare = {
        auto: 10,
        car: 20,
        moto: 15
    };

    const perKmRate={
        auto:0.2,
        car:0.5,
        moto:0.3
    };


    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) ),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) ),
        moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) )
    };

    return fare;
}

module.exports.getFare = getFare;


// function getOtp(num) {
//     function generateOtp(num) {
//         const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
//         return otp;
//     }
//     return generateOtp(num);
// }

// module.exports.createRide = async ({
//     user, pickup, destination, vehicleType, status, fare
// }) => {
//     try {
        
//         if (!pickup.lat|| !pickup.lng|| !destination.lat || !destination.lng) {
//             throw new Error("at ride.service.js, missing lat or lng of pickup or destination");
//         }

//         // const fare = await getFare(pickup, destination);
//         // console.log('Calculated fare:', fare);  

//         const ride = await rideModel.create({
//             user,
//             pickup: {
//                 address: pickup.address,
//                 location: {
//                     type: 'Point',
//                     coordinates: [
//                         parseFloat(pickup.lng), // longitude first
//                         parseFloat(pickup.lat)  // latitude second
//                     ]
//                 }
//             },
//             destination: {
//                 address: destination.address,
//                 location: {
//                     type: 'Point',
//                     coordinates: [
//                         parseFloat(destination.lng), // longitude first
//                         parseFloat(destination.lat)  // latitude second
//                     ]
//                 }
//             },
//             vehicleType,
//             otp: getOtp(6),
//             // fare: fare[vehicleType]
//             status:status
//             fare:fare
//         });

//         return ride;
//     } catch (error) {
//         console.error('Error in createRide service at ride.service.js:', error);
//         throw error;
//     }
// }

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required  at ride.service.js');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'accepted',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');


    console.log("ride.servcie.js me Confirmed ride:", ride);
    

    return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required at ride.service.js');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user')
    .populate('captain')
    .select('+otp');

    if (!ride) {
        throw new Error('Ride not found at ride.service.js');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted at ride.service.js');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP at ride.service.js');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing'
    });

    console.log("ride.service.js me Started ride:", ride);

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required at ride.service.js endRide');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing/started');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'completed'
    });

    console.log("ride.servcie.js me Ended ride:", ride);

    return ride;
}

