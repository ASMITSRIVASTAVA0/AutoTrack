const express=require("express");
const router=express.Router();
const captainController=require("../controller/captain.controller");
const {body}=require("express-validator");
const authMiddleware=require("../middlewares/auth.middleware");

router.post("/register",[
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname").isLength({min:3}).withMessage("First name must be 3 characters long"),
    body("password").isLength({min:6}).withMessage("Password must be 6 characters long"),
    body("vehicle.plate").isLength({min:3}).withMessage("Plate number must be 3 character long"),
    body("vehicle.capacity").isInt({min:1}).withMessage("Capacity must be atleast 1"),
    body("vehicle.vehicleType").isIn(["Car","Motorcycle","Auto"]).withMessage("Invalid Vehicle-type")
],
captainController.registerCaptain
);

router.post("/login",[
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({min:6}).withMessage("Password must be 6 characters long")
],
captainController.loginCaptain

)


router.get("/profile",authMiddleware.authCaptain,captainController.getCaptainProfile);

router.get("/logout",authMiddleware.authCaptain,captainController.logoutCaptain);

module.exports=router;