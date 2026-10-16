import mongoose, { Mongoose } from "mongoose";
import { DB_URL,DB_NAME } from "../../config/config.service.js";

const connectDB = async()=>{
    try{
        mongoose.connection.on("connected",()=>{
            console.log("MongoDB connected successfully"); 
        });
      await mongoose.connect(DB_URL,{
            dbName: DB_NAME,
            serverSelectionTimeoutMS:5000,
        });
       
    }
   catch(error){
    console.log("Error connecting MongoDB" , error); 
   }
};

export default connectDB;