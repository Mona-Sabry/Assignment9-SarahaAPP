import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASSWORD } from "../../../config/config.service.js";
import { emailSubject } from "../enums/email.enum.js";


export async function sendEmail({to ="" ,subject= "" , text = "",  html = "", cc = "" , bcc = "" , attachments = []}){
    // Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: USER_EMAIL,
    pass: USER_PASSWORD,
  },
});


try {
  const info = await transporter.sendMail({
    from: `"Mona Sabry" <${USER_EMAIL}>`, // sender address
    to, 
    subject: subject || emailSubject[type], 
    text, 
    html, 
    cc,
    bcc,
    attachments,
  });
    console.log("Message sent: %s", info.messageId);
}catch (error){
      console.error("Error while sending mail:", error);
}
};

