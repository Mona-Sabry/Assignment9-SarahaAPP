import express from "express";
import bootstrap from "./app.controller.js";
import { PORT } from "./config/config.service.js";

const app = express();

await bootstrap(app,express);

app.listen(PORT,()=>{
    console.log(`Server is running https://127.0.0.1:${PORT}`);
    
});