import { Router } from "express";
import * as messageService from "./message.service.js";
import * as validators from "./message.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  cloudFileUpload,
  fileValidators,
} from "../../utils/multer/cloud.multer.js";
import { authentication } from "../../middleware/auth.middleware.js";
const router = Router();

router.post(
  "/:recieverId",
  cloudFileUpload({ fileValidation: fileValidators.image }).array(
    "attachments",
    2
  ),
  validation(validators.sendMessage),
  messageService.sendMessage
);

router.get(
  "/:messageId",
  authentication(),
  validation(validators.getMessage),
  messageService.getMessageById
);

router.delete(
  "/:messageId/freeze",
  authentication(),
  validation(validators.freezeMessage),
  messageService.freezeMessage
);

router.delete(
  "/:messageId/hardDelete",
  authentication(),
  validation(validators.hardDeleteMessage),
  messageService.hardDeleteMessage
);

export default router;
