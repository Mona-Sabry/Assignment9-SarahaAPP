import { OAuth2Client } from "google-auth-library";
import { CLIENT_ID } from "../../../config/config.service.js";
import * as dbService from "../../DB/database.repository.js";
import TokenModel from "../../DB/Models/token.model.js";
import userModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { logoutTypeEnum, providerEnum } from "../../Utils/enums/user.enum.js";
import { emailEvent } from "../../Utils/events/email.events.js";
import { generateOTP } from "../../Utils/generateOTP.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response.js";
import successResponse from "../../Utils/response/success.response.js";
import { encrypt } from "../../Utils/security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import { getNewLoginCredentials } from "../../Utils/token/token.js";

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
  const otp = generateOTP();
  const hashedotp = await generateHash({
    plaintext: String(otp),
    algorithm: HashEnum.Argon2,
  });
  const newUser = await dbService.create({
    model: userModel,
    data: [
      {
        username,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        confirmEmailOTP: hashedotp,
        gender,
        role,
        DOB,
      },
    ],
  });

  emailEvent.emit("confirmEmail", { to: email, otp, firstName: username });

  successResponse({
    res,
    message: "User created successfully",
    statusCode: 201,
    data: { newUser },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
    update:{$unset:{changeCredentialTime:true}}
  });
  if (!user) {
    throw NotFoundException("User Not Found");
  }
  const isPasswordValid = await compareHash({
    plaintext: password,
    ciphertext: user.password,
    algorithm: HashEnum.Argon2,
  });

  if (!isPasswordValid) {
    throw BadRequestException({ message: "Invalid email or password" });
  }

  const tokens = await getNewLoginCredentials(user);
  successResponse({
    res,
    message: "User logged in successfully",
    data: { tokens },
  });
};

export const confirmEmail = async (req, res) => {
  const { email, otp } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOTP: { $exists: true },
    },
  });
  if (!user) {
    throw BadRequestException({ message: "Invalid ascount" });
  }
  const isOtpVaild = await compareHash({
    plaintext: String(otp),
    ciphertext: user.confirmEmailOTP,
    algorithm: HashEnum.Argon2,
  });
  if (!isOtpVaild) {
    throw BadRequestException({ message: "Invalid OTP" });
  }
  await dbService.updateOne({
    model: userModel,
    filter: { email },
    update: { confirmEmail: Date.now(), $unset: { confirmEmailOTP: true } },
  });
  successResponse({
    res,
    message: "Email Confirmed Successfully",
  });
};

export const refreshToken = async (req, res) => {
  const tokens = await getNewLoginCredentials(req.user);
  successResponse({ res, message: "Done", data: { tokens } });
};

async function verifyGoogleAccount(idToken) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const loginWithGmail = async (req, res) => {
  const { idToken } = req.body;
  const { email, picture, given_name, family_name, email_verified } =
    await verifyGoogleAccount(idToken);

  if (!email_verified) {
    throw BadRequestException({ message: "Email not verified" });
  }
  const user = await dbService.findOne({ model: userModel, filter: { email } });
  if (user) {
    if (user.provider === providerEnum.Google) {
      const tokens = await getNewLoginCredentials(user);
      successResponse({ res, message: "Done", data: { tokens } });
    }
  } else {
    const newUser = await dbService.create({
      model: userModel,
      data: [
        {
          firstName: given_name,
          lastName: family_name,
          email,
          profilePic: picture,
          provider: providerEnum.Google,
        },
      ],
    });
  }
  const tokens = await getNewLoginCredentials(newUser);
  successResponse({ res, message: "Done", statusCode: 201, data: { tokens } });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const hashedOtp = await generateHash({
    plaintext: String(otp),
    algorithm: HashEnum.Argon2,
  });
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.System,
      confirmEmail: { $exists: true },
    },
    update: { forgetPasswordOTP: hashedOtp },
  });
  if (!user) {
    throw BadRequestException({ message: "Invalid account" });
  }
  emailEvent.emit("forgetPassword", {
    to: email,
    otp,
    firstName: user.firstName,
  });
  successResponse({
    res,
    message: "Check your inbox",
  });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.System,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true },
    },
  });
  if (!user) {
    throw BadRequestException({ message: "Invalid account" });
  }
  const isOtpValid = await compareHash({
    plaintext: String(otp),
    ciphertext: user.forgetPasswordOTP,
    algorithm: HashEnum.Argon2,
  });
  if (!isOtpValid) {
    throw BadRequestException({ message: "Invalid otp" });
  }
  const hashedPassword = await generateHash({
    plaintext: newPassword,
    algorithm: HashEnum.Argon2,
  });
  await dbService.updateOne({
    model: userModel,
    filter: { email },
    update: { password: hashedPassword, $unset: { forgetPasswordOTP: true } },
  });
  successResponse({ res, message: "Password Reset Successfully" });
};

export const logout = async (req, res) => {
  const { flag } = req.query;
  let status = 200;
  switch (flag) {
    case logoutTypeEnum.logout:
      await dbService.create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: new Date(req.decoded.exp * 1000),
          },
        ],
      });
      status = 201;
      break;
    case logoutTypeEnum.logoutFromAll:
      await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        update: { changeCredentialTime: Date.now() },
      });
      break;
  }
  successResponse({ res, message: "Logout successfully", statusCode: status });
};
