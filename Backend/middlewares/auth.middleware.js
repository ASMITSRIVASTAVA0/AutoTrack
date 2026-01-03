




// this file sets, user,parent,captain in req.body after validation





const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blacklistToken.model');
const captainModel = require('../models/captain.model');
const parentModel = require('../models/parent.model'); // Add this import


module.exports.authUser = async (req, res, next) => {
    const tokenUser = req.cookies.tokenUser || req.headers.authorization?.split(' ')[ 1 ];

    if (!tokenUser) {
        return res.status(401).json({ message: 'Unauthorized User, Token not Found in cookies' });
    }

    // console.log("finding blacklisted token at auth.middleware.js, tokenUser="+tokenUser);
    const isBlacklisted = await blackListTokenModel.findOne({ token: tokenUser });
    // console.log("isBlacklisted: ", isBlacklisted);
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized User, Token gets expired!' });
    }

    try {
    
        const decoded = jwt.verify(tokenUser, process.env.JWT_SECRET+"user");
        
        const user = await userModel.findById(decoded._id)

        req.user = user;//save user to req.body SAYAD

        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized User' });
    }
}

module.exports.authCaptain = async (req, res, next) => {
    const tokenCaptain = req.cookies.tokenCaptain || req.headers.authorization?.split(' ')[1];
    // console.log("tokenCaptain="+tokenCaptain);
    if (!tokenCaptain) {
        return res.status(401).json({ message: 'Unauthorized Captain' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token: tokenCaptain });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized Captain' });
    }

    try {
        const decoded = jwt.verify(tokenCaptain, process.env.JWT_SECRET+"captain");
        
        const captain = await captainModel.findById(decoded._id);
        req.captain = captain;
        return next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Unauthorized Captain' });
    }
}

module.exports.authParent = async (req, res, next) => {
    const tokenParent = req.cookies.tokenParent || req.headers.authorization?.split(' ')[1];

    if (!tokenParent) {
        return res.status(401).json({ message: 'Unauthorized Parent' });
    }

    // console.log("finding blacklisted token at auth.middleware.js for parent");
    const isBlacklisted = await blackListTokenModel.findOne({ token: tokenParent });
    // console.log("isBlacklisted: ", isBlacklisted);
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized Parent' });
    }

    try {
        const decoded = jwt.verify(tokenParent, process.env.JWT_SECRET+"parent");
        
        const parent = await parentModel.findById(decoded._id)

        req.parent = parent;

        return next();

    } catch (err) {
        console.error('Token verification error at auth.middleware.js', err);
        return res.status(401).json({ message: 'Unauthorized Parent' });
    }
}