const express=require("express");
const router=express.Router();


// destructuring body function from exported object of express-validator
const {body}=require("express-validator");

const userController=require("../controller/user.controller");


// arr contain validation functions from express-validator,arr groups mulitple middlewares
// route.post("/route",[middleware1,middleware2,...etc],finalHandler)
router.post("/register",[
    body("email").isEmail().withMessage("invalid email"),
    body("fullname.firstname").isLength({min:3}).withMessage("First name must be 3 character long"),
    body("password").isLength({min:6}).withMessage("Password must be 6 character long")
],
userController.registerUser
)


module.exports=router;