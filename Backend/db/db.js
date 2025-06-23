const mongoose=require("mongoose");

async function connectToDb(){
    try{
        await mongoose.connect(process.env.DB_CONNECT
        //     ,{
        //     useNewUrlParser:true,
        //     useUnifiedTopology: true
        // }
    );

        console.log("connected to db");
    }
    catch(err){
        console.log("db connection err=",err.message);
    }
}


module.exports=connectToDb;