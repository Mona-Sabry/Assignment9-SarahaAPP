import { EventEmitter } from "node:events";
import { sendEmail } from "../email/nodemailer.email.js";
import { emailSubject } from "../enums/email.enum.js";
import { template } from "../email/generateHTML.js.js";


export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data)=>{
    await sendEmail({
        to:data.to,
        subject:emailSubject.confirmEmail,
        html:template(data.otp , data.firstName , emailSubject.confirmEmail),
    }).catch((err)=>{
      console.log("Error sending confirm email" , err);
   });
});


emailEvent.on("forgetPassword", async (data)=>{
    await sendEmail({
        to:data.to,
        subject:emailSubject.resetPassword,
        html:template(data.otp , data.firstName , emailSubject.resetPassword),
    }).catch((err)=>{
      console.log("Error sending forget password email" , err);
   });
});