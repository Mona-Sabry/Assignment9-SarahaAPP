import jwt from "jsonwebtoken";
import {
  JWT_ADMIN_SECRET_ACCESS,
  JWT_ADMIN_SECRET_REFRESH,
  JWT_EXPIRE_IN_ACCESS,
  JWT_EXPIRE_IN_REFRESH,
  JWT_USER_SECRET_ACCESS,
  JWT_USER_SECRET_REFRESH,
} from "../../../config/config.service.js";
import UserModel from "../../DB/Models/user.model.js";
import { findById } from "../../DB/database.repository.js";
import { roleEnum, signatureEnum, tokenTypeEnum } from "../enums/user.enum.js";
import {
  BadRequestException,
  NotFoundException,
} from "../response/error.response.js";

export const generateToken = ({ payload, secretkey, options }) => {
  return jwt.sign(payload, secretkey, options);
};

export const varifyToken = ({ token, secretkey }) => {
  return jwt.verify(token, secretkey);
};

export const getSignature = ({ signatureLevel = signatureEnum.User }) => {
  let signature = { accessSignature: undefined, refreshSignature: undefined };

  switch (signatureLevel) {
    case signatureEnum.Admin:
      signature.accessSignature = JWT_ADMIN_SECRET_ACCESS;
      signature.refreshSignature = JWT_ADMIN_SECRET_REFRESH;
      break;
    case signatureEnum.User:
      signature.accessSignature = JWT_USER_SECRET_ACCESS;
      signature.refreshSignature = JWT_USER_SECRET_REFRESH;
      break;
    default:
      signature.accessSignature = JWT_USER_SECRET_ACCESS;
      signature.refreshSignature = JWT_USER_SECRET_REFRESH;
  }
  return signature;
};

export const getNewLoginCredentials = async (user) => {
  const signature = await getSignature({
    signatureLevel:
      user.role != roleEnum.Admin ? signatureEnum.User : signatureEnum.Admin,
  });
  console.log(signature);

  const accessToken = generateToken({
    payload: { id: user._id },
    secretkey: signature.accessSignature,
    options: { expiresIn: Number(JWT_EXPIRE_IN_ACCESS) },
  });

  const refreshToken = generateToken({
    payload: { id: user._id },
    secretkey: signature.refreshSignature,
    options: { expiresIn: JWT_EXPIRE_IN_REFRESH },
  });
  return {
    accessToken,
    refreshToken,
  };
};

export const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.Access,
}) => {
  const [Bearer, token] = authorization.split(" ");
  if (!Bearer || !token) {
    throw BadRequestException({ message: "Invalid token" });
  }

  let signature = await getSignature({
    signatureLevel:
      Bearer === "Admin" ? signatureEnum.Admin : signatureEnum.User,
  });

  const decoded = varifyToken({
    token,
    secretkey:
      tokenType === tokenTypeEnum.Access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  //payload
  const user = await findById({ model: UserModel, id: decoded.id });
  if (!user) {
    throw NotFoundException({ message: "Not Registered Account" });
  }
  return {
    user,
    decoded,
  };
};
