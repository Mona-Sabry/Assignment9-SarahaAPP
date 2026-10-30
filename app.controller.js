import { authRouter, userRouter, messageRouter } from "./src/Modules/index.js";
import successResponse from "./src/Utils/response/success.response.js";
import {BadRequestException, globalErrorHandler} from "./src/Utils/response/error.response.js";
import connectDB from "./src/DB/connection.js";
import cors from "cors";
import {resolve} from "node:path";


const bootstrap = async (app, express) => {
  app.use(express.json(),cors());

  await connectDB();

  app.get("/",(req,res)=>{
    successResponse({res, statusCode:200 , message:"Hello from Saraha Application"})
  })

   app.use("/uploads", express.static(resolve("./src/uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/message", messageRouter);


  app.all("/*dummy",(req,res)=>{
    throw BadRequestException({message:"Not Found Handler!!"});
  });

  app.use(globalErrorHandler);
 
};


export default bootstrap;
