import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { roleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post("/signup", authService.signup);
router.post("/login", authService.login);
router.post(
    "/refresh-token",
    authentication({tokenType:tokenTypeEnum.Refresh}),
    authorization({accessRoles:[roleEnum.Admin,roleEnum.User]}),
     authService.refreshToken);
router.post("/social-login", authService.loginWithGmail);

export default router;