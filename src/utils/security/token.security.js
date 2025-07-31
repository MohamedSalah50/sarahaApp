import jwt from "jsonwebtoken";
import userModel, { roleEnum } from "../../db/models/user.model.js";
import { findById, findOne } from "../../db/models/dbservices.js";
import { nanoid } from "nanoid";
import revokeTokenModel from "../../db/models/revoke.token.model.js";

export const signatureTypeEnum = { system: "System", bearer: "Bearer" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };

export const generateToken = async ({
  payload = {},
  signature = "",
  options = { expiresIn: "" },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = async ({ token = "", signature = "" } = {}) => {
  return jwt.verify(token, signature);
};

export const getSignatures = async ({
  signatureLevel = signatureTypeEnum.bearer,
} = {}) => {
  const signatures = {
    accessSignature: undefined,
    refreshSignature: undefined,
  };

  switch (signatureLevel) {
    case signatureTypeEnum.system:
      signatures.accessSignature = process.env.ACCESS_TOKEN_SYSTEM_SECRET;
      signatures.refreshSignature = process.env.REFRESH_TOKEN_SYSTEM_SECRET;
      break;
    default:
      signatures.accessSignature = process.env.ACCESS_TOKEN_USER_SECRET;
      signatures.refreshSignature = process.env.REFRESH_TOKEN_USER_SECRET;
      break;
  }
  return signatures;
};

export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypeEnum.access,
  next,
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!token || !bearer) {
    throw new Error("Missing token parts", { cause: 400 });
  }

  const signature = await getSignatures({ signatureLevel: bearer, tokenType });

  const decoded = await verifyToken({
    token,
    signature:
      tokenType === tokenTypeEnum.access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  if (
    await findOne({ model: revokeTokenModel, filter: { idToken: decoded.jti } })
  ) {
    return next(
      new Error("user have signed out from this device ", { cause: 401 })
    );
  }

  const user = await findById({ model: userModel, id: decoded._id });

  if (!user) {
    throw new Error("Not registered account", { cause: 404 });
  }

  if (
    user.changeLoginCredentials &&
    decoded.iat * 1000 < new Date(user.changeLoginCredentials).getTime()
  ) {
    return next(new Error("old login credentials", { cause: 401 }));
  }

  return { user , decoded };
};

export const getLoginCredentials = async ({ user = {} }) => {
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
      jwtid: tokenId,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION),
    },
  });

  const refreshToken = await generateToken({
    payload: { _id: user._id },
    signature: signatures.refreshSignature,
    options: {
      jwtid: tokenId,
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION),
    },
  });

  return { accessToken, refreshToken };
};
