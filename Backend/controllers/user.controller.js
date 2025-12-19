const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blacklistToken.model');
const parentModel=require("../models/parent.model.js");

module.exports.registerUser = async (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("err in user.controlller.js");
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    const isUserAlready = await userModel.findOne({ email });

    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exist with this Email id' });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });



    const tokenUser = user.generateAuthToken();
    console.log("user created successfully");
    console.log(user);

    res.cookie('tokenUser', tokenUser);

    res.status(201).json({ tokenUser, user });


}

module.exports.loginUser = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokenUser = user.generateAuthToken();

    res.cookie('tokenUser', tokenUser);

    res.status(200).json({ tokenUser, user });
}

module.exports.logoutUser = async (req, res, next) => {
    console.log("Logging out user req");
    res.clearCookie('tokenUser');
    const tokenUser = req.cookies.tokenUser || req.headers.authorization.split(' ')[ 1 ];

    await blackListTokenModel.create({ tokenUser });

    res.status(200).json({ message: 'Logged out' });

}

module.exports.getUserProfile = async (req, res, next) => {

    res.status(200).json(req.user);

}


module.exports.getParentDetails = async (req, res, next) => {
    try {
        const userId = req.user._id;//auth.middleware.js me req.user=user
        
        const user = await userModel.findById(userId);
        
        if (!user.parentId) {
            return res.status(404).json({ message: 'No parent found' });
        }
        
        // Get parent details
        const parent = await parentModel.findById(user.parentId)
            .select('fullname email createdAt');//return only these 3 attributes
        
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        
        res.status(200).json({ parent });
    } catch (err) {
        console.error('Error getting parent details at user.controller.js:', err);
        res.status(500).json({ message: err.message });
    }
}


module.exports.removeParent = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // Find user
        const user = await userModel.findById(userId);
        if (!user.parentId) {
            return res.status(400).json({ message: 'No parent to remove' });
        }
        
        const parentId = user.parentId;
        
        // Remove parent reference from user
        user.parentId = null;
        await user.save();
        
        // Remove user from parent's children list
        await parentModel.findByIdAndUpdate(parentId, {
            $pull: { children: userId }
        });
        
        console.log(`removeparent called at userParent.controller.js, User ${user.fullname.firstname} removed parent ${parentId}`);
        
        // Fetch the updated user to ensure all virtuals/populates are included
        const updatedUser = await userModel.findById(userId);
        
        res.status(200).json({ 
            message: 'Parent removed successfully',
            user: updatedUser // Return the complete user object
        });
    } catch (err) {
        console.error('Error removing parent at user.controller.js:', err);
        res.status(500).json({ message: err.message });
    }
}