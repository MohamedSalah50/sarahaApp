import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { genderEnum } from "../../db/models/user.model.js";
import { fileValidators } from "../../utils/multer/local.multer.js";

export const shareProfile = {
  params: Joi.object()
    .keys({
      userId: generalFields.id.required(),
    })
    .required(),
};

export const updateBasicProfile = {
  body: Joi.object()
    .keys({
      firstName: generalFields.fullName,
      lastName: generalFields.fullName,
      phone: generalFields.phone,
      gender: Joi.string().valid(...Object.values(genderEnum)),
    })
    .required(),
};

export const freezeAccount = {
  params: Joi.object()
    .keys({
      userId: generalFields.id,
    })
    .required(),
};

export const restoreAccount = {
  params: Joi.object()
    .keys({
      userId: generalFields.id,
    })
    .required(),
};

export const hardDelete = {
  params: Joi.object()
    .keys({
      userId: generalFields.id,
    })
    .required(),
};

export const updatePassword = {
  body: Joi.object()
    .keys({
      oldPassword: generalFields.password,
      password: generalFields.password,
      confirmPassword: generalFields.confirmPassword,
    })
    .required(),
};

export const profileImage = {
  file: Joi.object()
    .keys({
      fieldname: generalFields.file.fieldname.valid("image").required(),
      originalname: generalFields.file.originalname.required(),
      encoding: generalFields.file.encoding.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidators.image)
        .required(),
      // finalPath: generalFields.file.finalPath.required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.filename.required(),
      path: generalFields.file.path.required(),
      size: generalFields.file.size.required(),
    })
    .required(),
};

export const profileCoverImage = {
  file: Joi.array()
    .items(
      Joi.object()
        .keys({
          fieldname: generalFields.file.fieldname.valid("images").required(),
          originalname: generalFields.file.originalname.required(),
          encoding: generalFields.file.encoding.required(),
          mimetype: generalFields.file.mimetype
            .valid(...fileValidators.image)
            .required(),
          // finalPath: generalFields.file.finalPath.required(),
          destination: generalFields.file.destination.required(),
          filename: generalFields.file.filename.required(),
          path: generalFields.file.path.required(),
          size: generalFields.file.size.required(),
        })
        .required()
    )
    .min(1)
    .max(2)
    .required(),
};
