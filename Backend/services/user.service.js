const userModel=require("../models/user.model");

module.exports.createUser=async ({
    firstname,lastname,email,password
})=>{
    console.log("firstname=",firstname,"lastname=",lastname," email=",email," password="+password);
    
    if(!firstname || !email || !password)
    throw new Error("All fields re required");

    const user=userModel.create({
        fullname:{
            firstname,
            lastname
        },
        email,
        password
    });

    return user;
}