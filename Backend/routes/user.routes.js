const express=require("express");
const router=express.Router();
const authMiddleware=require("../middlewares/auth.middleware");


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


router.post("/login",[
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({min:6}).withMessage("Invalid Password")
],
userController.logInUser
)



router.get("/profile",authMiddleware.authUser,userController.getUserProfile);

router.get("/logout",authMiddleware.authUser,userController.logoutUser);

module.exports=router;