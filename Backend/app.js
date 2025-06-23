/*
dotenv loads environment variables from .env file into process.env 
cors=cross origin resource sharing, allow req from diff local hosts, 3000, 5000, etc
*/

const dotenv=require("dotenv");
dotenv.config();

const express=require("express");

const cors=require("cors");

const app=express();

app.use(cors());

app.get("/",(req,res)=>{
    res.send("hello world");
});



module.exports=app;