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

