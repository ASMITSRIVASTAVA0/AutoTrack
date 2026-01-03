const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const parentSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long'],
        },
        lastname: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long'],
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String,
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    notifications: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        rideId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ride'
        },
        captainId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'captain'
        },
        captainName: String,
        captainLocation: {
            lat: Number,
            lng: Number
        },
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    pendingChildRequests: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        userName: String,
        requestedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    }],
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
});

parentSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET+"parent", { expiresIn: '24h' });
    return token;
}

parentSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

parentSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

const parentModel = mongoose.model('parent', parentSchema);

module.exports = parentModel;