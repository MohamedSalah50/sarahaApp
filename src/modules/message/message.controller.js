import { Router } from "express";
import * as messageService from "./message.service.js" 
import * as validators from "./message.validation.js"; 
import { validation } from "../../middleware/validation.middleware.js";
import { cloudFileUpload, fileValidators } from "../../utils/multer/cloud.multer.js";
const router = Router();

router.post("/:recieverId",cloudFileUpload({fileValidation:fileValidators.image}).array("attachments",2),validation(validators.sendMessage),messageService.sendMessage)



export default router