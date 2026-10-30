import { fileTypeFromBuffer } from "file-type";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { BadRequestException } from "../response/error.response.js";

export const validationMagicNumbers = (allowedTypes = []) => {
  const allowed = allowedTypes.map((t) => {
    t === "image/jpg" ? "image/jpeg" : t;
  });
  return async (req, resizeBy, next) => {
    const files = req.file ? [req.file] : req.files || [];
    for (const file of files) {
      const buffer = await fs.promises.readFile(files.path);
      const type = await fileTypeFromBuffer(buffer);

      if (!type || !allowed.includes(type.mime)) {
        await Promise.all(files.map((f) => fs.promises.unlink(f.path))).catch(
          () => {},
        );
        throw BadRequestException({
          message: `Invalid file type :${file.originalname} content does not match an allowed type`,
        });
      }
    }
    next();
  };
};

export const fileValidation = {
  images: ["image/png", "image/webp", "image/jpg"],
  videos: ["video/mp4", "video/mpeg"],
  audios: ["audio/webm", "audio/mpeg", "audio/mp4"],
  documents: ["application/pdf", "application/msword"],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
}) => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;
      if (req.user?._id) {
        userBasePath += `/${req.user._id}`;
      }
      const fullPath = path.resolve(`./src/${userBasePath}`);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, path.resolve(fullPath));
    },

    filename: (req, file, cb) => {
      const uniqueFileName =
        Date.now() + "-" + Math.random() + "-" + file.originalname;
      file.finalPath = `${basePath}/${req.user._id}/${uniqueFileName}`;
      cb(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!validation.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    } else {
      cb(null, true);
    }
  };

  return multer({ fileFilter, storage });
};
