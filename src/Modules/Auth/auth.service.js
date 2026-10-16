import * as dbService from "../../DB/database.repository.js";
import userModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
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
  successResponse({
    res,
    message: "User logged in successfully",
    data: { user },
  });
};
