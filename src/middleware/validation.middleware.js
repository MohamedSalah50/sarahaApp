import joi from "joi";
import { asyncHandler } from "../utils/response.js";
import { Types } from "mongoose";

export const generalFields = {
  fullName: joi.string().min(2).max(20).messages({
    "string.max": "max fullName length is 20 char",
    "any.required": "fullName is mandatory!!",
    "string.empty": "empty value not allowed",
  }),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmPassword: joi.string().valid(joi.ref("password")),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
  id: joi.string().custom(async (value, helper) => {
    // console.log({ value, match: Types.ObjectId.isValid(value) });
    return Types.ObjectId.isValid(value)
      ? true
      : helper.message("in-valid mongoDB id");
  }),
};

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validateAsync(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationErrors.push(validationResult.error?.details);
      }
    }

    if (validationErrors.length) {
      return res
        .status(400)
        .json({ err_message: "validation error", error: validationErrors });
    }

    return next();
  });
};
