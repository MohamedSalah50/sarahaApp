import {
  create,
  findById,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../db/models/dbservices.js";
import { customAlphabet, nanoid } from "nanoid";
import userModel, {
  providerEnum,
  roleEnum,
} from "../../db/models/user.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import { generateEncryption } from "../../utils/security/encryption.security.js";
import { OAuth2Client } from "google-auth-library";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hashing.security.js";
import {
  generateToken,
  getSignatures,
  signatureTypeEnum,
  verifyToken,
} from "../../utils/security/token.security.js";
import { emitter } from "../../utils/events/email.event.js";
import { emailTemplate } from "../../utils/email/email.template.js";

//service helpers functions
async function verify(idToken) {
  const client = new OAuth2Client(process.env.CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

async function generateLoginTokin(user) {
  const signatures = await getSignatures({
    signatureLevel:
      user.role != roleEnum.user
        ? signatureTypeEnum.system
        : signatureTypeEnum.bearer,
  });

  const tokenId = nanoid();

  const accessToken = await generateToken({
    payload: { _id: user._id, name: user.firstName },
    signature: signatures.accessSignature,
    options: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      jwtid: tokenId,
    },
  });

  const refreshToken = await generateToken({
    payload: { _id: user._id },
    signature: signatures.refreshSignature,
    options: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      jwtid: tokenId,
    },
  });

  return { accessToken, refreshToken };
}

//system
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  const exsistUser = await findOne({ model: userModel, filter: { email } });

  if (exsistUser) {
    return next(new Error("user already exsist", { cause: 409 }));
  }

  const encryptedPhone = await generateEncryption({ plainText: phone });

  const hashedPassword = await generateHash({ plainText: password });

  const otp = customAlphabet("1234567890", 6)();

  const hashedOtp = await generateHash({ plainText: otp });
  const otpCreatedAt = new Date();

  const user = await create({
    model: userModel,
    data: {
      fullName,
      email,
      password: hashedPassword,
      phone: encryptedPhone,
      confirmHashedOtp: hashedOtp,
      otpCreatedAt,
      otpFailedAttempts: 0,
      otpBanUntil: null,
    },
  });

  emitter.emit("sendConfirmEmail", {
    to: email,
    subject: "forgot-Password",
    html: emailTemplate({ otp, title: "confirm email" }),
  });

  return successResponse({
    res,
    message: "signup successfful",
    status: 201,
    data: { user },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await findOne({
    model: userModel,
    filter: { email, provider: providerEnum.system },
  });

  if (!user) {
    return next(new Error("in-valid login data or provider", { cause: 404 }));
  }

  if (!user?.confirmEmail) {
    return next(new Error("please verify your account first", { cause: 400 }));
  }

  const match = await compareHash({
    plainText: password,
    cipherText: user.password,
  });

  if (!match) {
    return next(new Error("in-valid login Data", { cause: 404 }));
  }

  const data = await generateLoginTokin(user);
  const { accessToken, refreshToken } = data;

  return successResponse({
    res,
    message: "login successful",
    data: { accessToken, refreshToken },
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { otp, email } = req.body;

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: false },
      confirmHashedOtp: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("invalid login data or provider", { cause: 404 }));
  }

  if (user.otpBanUntil && user.otpBanUntil > Date.now()) {
    const remaining = Math.ceil((user.otpBanUntil - Date.now()) / 1000);
    return next(
      new Error(
        `You are temporarily banned. Try again after ${remaining} seconds.`,
        { cause: 429 }
      )
    );
  }

  const otpAge = Date.now() - new Date(user.otpCreatedAt).getTime();
  if (otpAge > 2 * 60 * 1000) {
    return next(new Error("OTP has expired", { cause: 400 }));
  }

  const isMatch = await compareHash({
    plainText: otp,
    cipherText: user.confirmHashedOtp,
  });

  if (!isMatch) {
    const newAttempts = (user.otpFailedAttempts || 0) + 1;

    let updateData = {
      otpFailedAttempts: newAttempts,
    };

    if (newAttempts >= 5) {
      updateData.otpBanUntil = new Date(Date.now() + 5 * 60 * 1000); // lock for 5 mins
      updateData.otpFailedAttempts = 0; // reset after ban
    }

    await updateOne({
      model: userModel,
      filter: { _id: user._id },
      data: { $set: updateData },
    });

    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  await updateOne({
    model: userModel,
    filter: { email },
    data: {
      $set: {
        confirmEmail: Date.now(),
      },
      $unset: {
        confirmHashedOtp: 1,
        otpCreatedAt: 1,
        otpFailedAttempts: 1,
        otpBanUntil: 1,
      },
    },
  });

  return successResponse({
    res,
    message: "Email confirmed",
  });
});

//gmail

export const signupWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  const payload = await verify(idToken);

  const { email, email_verified, name, picture } = payload;

  if (!email_verified) {
    return next(new Error("email is not verified", { cause: 400 }));
  }

  const user = await findOne({ model: userModel, filter: { email } });
  if (user) {
    return next(new Error("user already exsist", { cause: 409 }));
  }

  const newUser = await create({
    model: userModel,
    data: {
      confirmEmail: Date.now(),
      email,
      fullName: name,
      provider: providerEnum.google,
      picture,
    },
  });

  return successResponse({
    res,
    message: "signup successfful",
    status: 201,
    data: { user: newUser },
  });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  const payload = await verify(idToken);

  const { email, email_verified } = payload;

  if (!email_verified) {
    return next(new Error("email is not verified", { cause: 400 }));
  }

  const user = await findOne({
    model: userModel,
    filter: { email, provider: providerEnum.google },
  });
  if (!user) {
    return next(
      new Error("invalid login data , in-valid email or provider", {
        cause: 400,
      })
    );
  }

  const data = await generateLoginTokin(user);
  const { accessToken, refreshToken } = data;

  return successResponse({
    res,
    message: "login successful",
    data: { accessToken, refreshToken },
  });
});

export const sendForgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const otp = customAlphabet("0123456789", 6)();
  const hashedOtp = await generateHash({ plainText: otp });

  const user = await findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      freezedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
    data: {
      forgotCode: hashedOtp,
    },
  });

  if (!user) {
    return next(new Error("not registered account", { cause: 404 }));
  }

  emitter.emit("forgotPassword", {
    to: email,
    subject: "forgot-Password",
    html: emailTemplate({ otp, title: "reset code" }),
  });

  return successResponse({ res, data: {} });
});

export const verifyForgotCode = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      freezedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("not registered account", { cause: 404 }));
  }

  if (!(await compareHash({ plainText: otp, cipherText: user.forgotCode }))) {
    return next(new Error("invalid otp", { cause: 400 }));
  }
  return successResponse({ res, data: {} });
});

export const resetForgetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      freezedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("not registered account", { cause: 404 }));
  }

  if (!(await compareHash({ plainText: otp, cipherText: user.forgotCode }))) {
    return next(new Error("invalid otp", { cause: 400 }));
  }

  const hashedPassword = await generateHash({ plainText: password });

  await updateOne({
    model: userModel,
    filter: {
      email,
    },
    data: {
      $set: { password: hashedPassword, changeLoginCredentials: Date.now() },
      $unset: { forgotCode: 1 },
      $inc: { __v: 1 },
    },
  });

  return successResponse({ res, data: {} });
});
