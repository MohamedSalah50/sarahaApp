import { Router } from "express";
import * as authService from "./auth.service.js";
import * as validateService from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

//systemService
router.post("/signup", validation(validateService.signup), authService.signup);
router.post("/login", validation(validateService.login), authService.login);

//gmailService
router.post(
  "/signupWithGmail",
  validation(validateService.signupWithGmail),
  authService.signupWithGmail
);
router.post("/loginWithGmail", authService.loginWithGmail);
router.patch(
  "/confirmEmail",
  validation(validateService.confirmEmail),
  authService.confirmEmail
);

router.patch(
  "/forgot-password",
  validation(validateService.forgotPassword),
  authService.sendForgotPassword
);
router.patch(
  "/verifyForgotCode",
  validation(validateService.verifyForgotCode),
  authService.verifyForgotCode
);

router.patch(
  "/resetForgetPassword",
  validation(validateService.resetForgetPassword),
  authService.resetForgetPassword
);

export default router;
