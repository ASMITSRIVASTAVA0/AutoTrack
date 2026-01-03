const mongoose = require('mongoose');

// slow to prevent brute force attack, automatic salting
const bcrypt = require('bcrypt');


const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
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
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parent'
    },
    pendingParentRequests: [{
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'parent'
        },
        parentName: {
            type: String,
            default:"Unknown",

        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    }]
    ,rideHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ride"
    }]
    ,isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });


userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET+"user", { expiresIn: '24h' });
    
    return token;
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// static, so available on model itself
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

const userModel = mongoose.model('user', userSchema);


module.exports = userModel;