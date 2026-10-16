import * as argon2 from "argon2";
import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.service.js";
import { HashEnum } from "../enums/security.enum.js";
import { BadRequestException } from "../response/error.response.js";

export const generateHash = async ({
  plaintext,
  saltRounds = Number(SALT_ROUND),
  algorithm = HashEnum.Bycrpt,
}) => {
  let hashResult = "";
  switch (algorithm) {
    case HashEnum.Bycrpt:
      hashResult = await hash(plaintext, saltRounds);
      break;

    case HashEnum.Argon2:
      hashResult = await argon2.hash(plaintext);
      break;

    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }
  return hashResult;
};

export const compareHash = async ({
  plaintext,
  ciphertext,
  algorithm = HashEnum.Bycrpt,
}) => {
  let match = false;
  switch (algorithm) {
    case HashEnum.Bycrpt:
      match = await compare(plaintext, ciphertext);
      break;

    case HashEnum.Argon2:
      match = await argon2.verify(ciphertext, plaintext);
      break;

    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }
  return match;
};
