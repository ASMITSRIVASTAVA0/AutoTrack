const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },
    pickup: {
        address: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    destination: {
        address: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    fare: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [ 'pending', 'accepted', 'ongoing', 'completed', 'cancelled' ],
        default: 'pending',
    },
    duration: {
        type: Number,
    }, // in seconds
    distance: {
        type: Number,
    }, // in meters
    paymentID: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },
    otp: {
        type: String,
        select: false,
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ['car', 'motorcycle', 'auto'],
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

// Create geospatial index for pickup location
rideSchema.index({ 'pickup.location': '2dsphere' });

module.exports = mongoose.model('ride', rideSchema);