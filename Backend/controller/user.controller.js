const userModel=require("../models/user.model");

const userService=require("../services/user.service");


// validationResult(req) method collect results from all validation checks run on incoming req,
const {validationResult} =require("express-validator");

const blacklistTokenModel=require("../models/blacklistToken.model");



// json({myerrors:errors.array()})=> myerrors is key name and errors.array() is all errors
module.exports.registerUser=async (req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {fullname,email,password}=req.body;

    const isUserAlreadyExists=await userModel.findOne({email});
    if(isUserAlreadyExists)
        return res.status(400).json({message:"User with same email id already exists"});

    const hashedPassword=await userModel.hashPassword(password);

    const user=await userService.createUser({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password: hashedPassword
    });

    const token=user.generateAuthToken();

    res.status(201).json({token,user});

}

module.exports.logInUser=async(req,res,next)=>{
    console.log("login post req");
    const {email,password}=req.body;
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        console.log("validation failed");
        return res.status(400).json({errors:errors.array()});
    }

    // userSchema pe password:select=false, jb user return ho to password bhi aye for that +password
    const user=await userModel.findOne({email}).select("+password");

    if(!user)
    return res.status(401).json({message:"Invalid Email or Password"});

    // this method defined in (my) userSchema
    const isMatch=await user.comparePassword(password);


    if(!isMatch)
    return res.status(401).json({message:"Invalid Email or Password"});

    const token=user.generateAuthToken();

    res.cookie("token",token);

    res.status(200).json({token,user});

}

module.exports.getUserProfile=async(req,res,next)=>{
    res.status(200).json(req.user);
}

module.exports.logoutUser=async(req,res,next)=>{
    res.clearCookie("token");
    const token=req.cookies.token || req.headers.authorization.split(" ")[1];

    await blacklistTokenModel.create({token});

    res.status(200).json({message:"Logged-out"});
}


