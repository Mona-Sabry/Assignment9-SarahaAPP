import crypto from "node:crypto";
import { ENC_KEY } from "../../../config/config.service.js";

const IV_LENGTH = 16;
const ENCRYPTION_SECRER_KEY = Buffer.from(ENC_KEY);

export const encrypt = (text)=>{
const iv = crypto.randomBytes(IV_LENGTH);
const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRER_KEY,
    iv,
);
let encryptedData = cipher.update(text,"utf-8","hex");
encryptedData +=cipher.final("hex");

return`${iv.toString("hex")}:${encryptedData}`;
};


export const decrypt = (encryptedDATA)=>{
const [ivHex,encryptedText] = encryptedDATA.split(":");
const binaryLikeIv = Buffer.from(ivHex,"hex");
const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRER_KEY,
    binaryLikeIv,
);
let decryptedData = decipher.update(encryptedText,"hex","utf-8");
decryptedData += decipher.final("utf-8");
return decryptedData;
};