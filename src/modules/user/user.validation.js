import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { genderEnum } from "../../db/models/user.model.js";

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
