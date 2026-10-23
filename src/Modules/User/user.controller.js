import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { roleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.get("/profile",
    authentication({tokenType: tokenTypeEnum.Access}),
    authorization ({accessRoles:[roleEnum.Admin]}),
    userService.getProfile);

export default router;