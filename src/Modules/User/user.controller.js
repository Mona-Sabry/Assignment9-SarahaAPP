import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../Middlewares/auth.middleware.js";
import { roleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import {
  fileValidation,
  localFileUpload,
  validationMagicNumbers,
} from "../../Utils/multer/local.multer.js";
import * as userService from "./user.service.js";

const router = Router();

router.get(
  "/profile",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [roleEnum.Admin] }),
  userService.getProfile,
);

router.patch(
  "/update-profile-pic",
  authentication({ tokenType: tokenTypeEnum.Access }), //req.user._id
  authorization({ accessRoles: [roleEnum.Admin] }),
  localFileUpload({
    customPath: "User",
    validation: [...fileValidation.images, ...fileValidation.documents],
  }).single("attachments"),
  userService.uploadProfilePic,
);

router.patch(
  "/update-cover-pic",
  authentication({ tokenType: tokenTypeEnum.Access }), //req.user._id
  authorization({ accessRoles: [roleEnum.Admin] }),
  localFileUpload({
      customPath: "User",
      validation: [...fileValidation.images, ...fileValidation.documents],
    }).array("attachments", 10),
    validationMagicNumbers(fileValidation.documents),
    userService.uploadCoverImages,
);

export default router;
