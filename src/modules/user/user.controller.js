import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../middleware/auth.middleware.js";
import { endPoint } from "./authorization.user.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js";
import {
  fileValidators,
  localFileUpload,
} from "../../utils/multer/local.multer.js";
import multer from "multer";

const router = Router();

router.get(
  "/",
  authentication(),
  authorization(endPoint.profile),
  userService.getUser
);

router.patch(
  "/updatePassword",
  authentication(),
  validation(validators.updatePassword),
  userService.updateUserPassword
);

router.get(
  "/:userId/profile",
  validation(validators.shareProfile),
  userService.shareProfile
);

router.get(
  "/refreshToken",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLoginCredentials
);

router.patch(
  "/updateBasicProfile",
  authentication(),
  validation(validators.updateBasicProfile),
  userService.updateBasicProfile
);

router.delete(
  "{/:userId}/freeze",
  authentication(),
  validation(validators.freezeAccount),
  userService.freezeAccount
);

router.patch(
  "{/:userId}/restore",
  authentication(),
  validation(validators.restoreAccount),
  userService.restoreAccount
);

router.delete(
  "{/:userId}/hard",
  authentication(),
  validation(validators.hardDelete),
  userService.hardDelete
);

router.post("/logout", authentication(), userService.logout);

router.patch(
  "/image",
  authentication(),
  localFileUpload({
    customPath: "user",
    fileValidation: fileValidators.image,
  }).single("attachment"),
  // .array("attachment")
  // .fields([
  //   {name:"profileImage",maxCount:1},
  //   {name:"coverImages",maxCount:3}
  // ]),
  // .any()
  userService.profileImage
);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size exceeds limit" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "in-valid file type") {
    return res.status(400).json({ message: err.message });
  }

  next(err);
});

export default router;
