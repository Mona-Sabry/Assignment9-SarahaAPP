import { CLIENT_ID } from "../../../config/config.service.js";
import * as dbService from "../../DB/database.repository.js";
import userModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { providerEnum } from "../../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response.js";
import successResponse from "../../Utils/response/success.response.js";
import { decrypt, encrypt } from "../../Utils/security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import { getNewLoginCredentials } from "../../Utils/token/token.js";
import {OAuth2Client} from "google-auth-library";

export const signup = async (req, res) => {
  const { username, email, password, phone, gender, role, DOB } = req.body;

  const user = await dbService.findOne({ model: userModel, filter: { email } });
  if (user) {
    throw ConflictException("User already exists");
  }

  const hashedPassword = await generateHash({
    plaintext: password,
    algorithm: HashEnum.Argon2,
  });

  const encryptedPhone = encrypt(phone);

  const newUser = await dbService.create({
    model: userModel,
    data: [
      {
        username,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        gender,
        role,
        DOB,
      },
    ],
  });
  successResponse({
    res,
    message: "User created successfully",
    statusCode: 201,
    data: { newUser },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
  });
  if (!user) {
    throw NotFoundException("User Not Found");
  }
  const isMatch = await compareHash({
    plaintext: password,
    ciphertext: user.password,
    algorithm: HashEnum.Argon2,
  });

  if (!isMatch) {
    throw BadRequestException("Invalid credentials");
  }
  if (user.phone) {
    user.phone = decrypt(user.phone);
  }
  const tokens = await getNewLoginCredentials(user);

  successResponse({
    res,
    message: "User logged in successfully",
    data: { tokens },
  });
};

export const refreshToken = async (req, res) => {
  const tokens = await getNewLoginCredentials(req.user);
  successResponse({ res, message: "Done", data: { tokens } });
};


async function verifyGoogleAccount(idToken){
const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,  
  });
  const payload = ticket.getPayload();
  return payload;
  };


export const loginWithGmail = async (req, res) => {
const {idToken} = req.body;
const {email, picture, given_name , family_name , email_verified} = await verifyGoogleAccount(idToken);

if(!email_verified){
  throw BadRequestException({message:"Email not verified"});
}
const user = await dbService.findOne({model:userModel , filter:{email}});
if(user){
  if(user.provider === providerEnum.Google){
    const tokens = await getNewLoginCredentials(user)
    successResponse({res, message:"Done", data:{tokens}});
  }
}else{
  const newUser = await dbService.create({model:userModel , data:[{
  firstName:given_name,
  lastName:family_name,
  email,
  profilePic:picture,
  provider:providerEnum.Google,
  }]});
  };
   const tokens = await getNewLoginCredentials(newUser)
    successResponse({res, message:"Done",statusCode:201, data:{tokens}});
};

