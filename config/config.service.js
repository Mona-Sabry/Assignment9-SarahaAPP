import {resolve} from "node:path";
import dotenv from "dotenv";

const envPath = {
    development:`.env.dev`,
    production:`.env.prod`,
};

dotenv.config({path:resolve (`./config/${envPath.development}`)});

export const PORT = process.env.PORT || 5000;
export const DB_NAME = process.env.DB_NAME || "Saraha";
export const DB_URL = process.env.DB_ATLAS_URL || process.env.DB_LOCAL_URL;
export const SALT_ROUND = process.env.SALT_ROUND || 10;
export const ENC_KEY = process.env.ENC_KEY;

export const JWT_USER_SECRET_ACCESS = process.env.JWT_USER_SECRET_ACCESS;
export const JWT_USER_SECRET_REFRESH = process.env.JWT_USER_SECRET_REFRESH;
export const JWT_ADMIN_SECRET_ACCESS = process.env.JWT_ADMIN_SECRET_ACCESS;
export const JWT_ADMIN_SECRET_REFRESH = process.env.JWT_ADMIN_SECRET_REFRESH;
export const JWT_EXPIRE_IN_ACCESS = process.env.JWT_EXPIRE_IN_ACCESS;
export const JWT_EXPIRE_IN_REFRESH = process.env.JWT_EXPIRE_IN_REFRESH;

export const CLIENT_ID = process.env.CLIENT_ID;