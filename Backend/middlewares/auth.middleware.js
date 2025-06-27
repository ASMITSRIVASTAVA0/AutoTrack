const userModel=require("../models/user.model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const BlackListToken=require("../models/blacklistToken.model");
const captainModel = require("../models/captain.model");


module.exports.authUser=async(req,res,next)=>{
    console.log("profile req");
    // const token=req.cookies.token || req.headers.authorization.split(" ")[1];
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log("/user/profile endpoint, token="+token);
    if(!token)
    {
        console.log("token not found");
        return res.status(401).json({message:"Unauthorized"});
    }

    // if user gets logout, then its token gets blacklisted

    const isBlacklisted=await BlackListToken.findOne({token:token});
    // const isBlacklisted=await userModel.findOne({token:token});

    if(isBlacklisted)
    {
        console.log("BLACKLIST TOKEN="+isBlacklisted);
        return res.status(401).json({message:"Unauthorized"});
    }

    try{
        // userSchema.methods.generateAuthToken=function(){const token=jwt.sign({_id:this._id},process.env.JWT_SECRET);return token;}
        // jwt.sign me sirf mongodb ki _id hi, so decoded me ye id hi bs
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log("decoded ="+decoded);
        // const user=await userSchema.findById(decoded._id);
        const user=await userModel.findById(decoded._id);
        console.log("user="+user);
        req.user=user;

        return next();
    }
    catch(err){
        console.log("error ="+err);
        return res.status(401).json({message:"Unauthorized"});
    }
}

module.exports.authCaptain=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message:"Unauthozired"});
    }

    const isBlacklisted=await BlackListToken.findOne({token:token});

    if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized"});
    }


    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const captain=await captainModel.findById(decoded._id);

        req.captain=captain;

        return next();
    }
    catch(err){
        return res.status(401).json({message:"Unauthorized"});
    }
}