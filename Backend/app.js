/*
dotenv loads environment variables from .env file into process.env 
cors=cross origin resource sharing, allow req from diff local hosts, 3000, 5000, etc
*/

const dotenv=require("dotenv");
dotenv.config();

const express=require("express");

const cors=require("cors");

const cookieParser=require("cookie-parser");

const app=express();

const connectToDb=require("./db/db");

const userRoutes=require("./routes/user.routes");

const captainRoutes=require("./routes/captain.routes");


connectToDb();

// app.use(cors());

app.use(cors({
  origin: "http://localhost:5173",  // your frontend URL
  credentials: true
}));

app.use(cookieParser());


// this middleware parse incoming req with content-type of json, make parsed data available in req.body
app.use(express.json());


// this middleware parse url-encoded form data 
// e.g. data = email=asmit@gmail.com&name=asmit, then req.body={email:"asmit@gmail.com",name:"asmit"}
// extended:true allow nested obj while false support flat key-valye pairs no nesting of objects
app.use(express.urlencoded({extended:true}));


app.get("/",(req,res)=>{
    res.send("hello world");
});

app.use("/users",userRoutes);

app.use("/captains",captainRoutes);

module.exports=app;