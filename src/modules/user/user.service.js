import {
  create,
  deleteOne,
  findById,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../db/models/dbservices.js";
import userModel, { roleEnum } from "../../db/models/user.model.js";
import { sendEmail } from "../../utils/email/send.email.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import {
  decryptEncryption,
  generateEncryption,
} from "../../utils/security/encryption.security.js";
import { getLoginCredentials } from "../../utils/security/token.security.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hashing.security.js";
import { customAlphabet } from "nanoid";
import revokeTokenModel from "../../db/models/revoke.token.model.js";
import {
  cloud,
  deleteFolderByPrefix,
  deleteResources,
  destroyFile,
  uploadFile,
  uploadFiles,
} from "../../utils/multer/cloudinary.js";

export const getUser = asyncHandler(async (req, res, next) => {

  const user = await findOne({model:userModel,filter:{_id:req.user._id},populate:[{path:"messages"}]})

  req.user.phone = await decryptEncryption({
    cipherText: req.user.phone,
  });

  return successResponse({ res, data: { user } });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await findOne({
    model: userModel,
    filter: { _id: userId },
    select: "-password -role",
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("no registered user", { cause: 404 }));
});

export const updateUserPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;

  if (
    !(await compareHash({
      plainText: oldPassword,
      cipherText: req.user.password,
    }))
  ) {
    return next(new Error("old password is in-correct", { cause: 400 }));
  }

  const hashedPassword = await generateHash({ plainText: password });

  const user = await updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      $set: { password: hashedPassword, changeLoginCredentials: Date.now() },
      $inc: { __v: 1 },
    },
  });

  return user.matchedCount
    ? successResponse({
        res,
        data: { user },
      })
    : next(new Error("not registered account", { cause: 404 }));
});

export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  const credentials = await getLoginCredentials({ user: req.user });
  return successResponse({ res, data: { credentials } });
});

export const updateBasicProfile = asyncHandler(async (req, res, next) => {
  if (req.user.phone) {
    req.user.phone = await generateEncryption({ plainText: req.user.phone });
  }

  const user = await findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      $set: req.body,
      $inc: { __V: 1 },
    },
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("not registered user", { cause: 404 }));
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== roleEnum.admin) {
    return next(
      new Error("regulal users isn't allowed to freeze this account ", {
        cause: 403,
      })
    );
  }

  const user = await updateOne({
    model: userModel,
    filter: { _id: userId || req.user._id, freezedAt: { $exists: false } },
    data: {
      $set: { freezedAt: Date.now(), freezedBy: req.user._id },
      $inc: { __V: 1 },
    },
  });

  return user.matchedCount
    ? successResponse({ res, data: { user } })
    : next(new Error("not registered user", { cause: 404 }));
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== roleEnum.admin) {
    return next(
      new Error("regulal users isn't allowed to restore this account ", {
        cause: 403,
      })
    );
  }

  const user = await updateOne({
    model: userModel,
    filter: { _id: userId || req.user._id, freezedAt: { $exists: true } },
    data: {
      $set: { restoredBy: req.user._id },
      $unset: { freezedAt: 1, freezedBy: 1 },
      $inc: { __V: 1 },
    },
  });

  return user.matchedCount
    ? successResponse({ res, data: { user } })
    : next(new Error("not registered user", { cause: 404 }));
});

export const hardDelete = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== roleEnum.admin) {
    return next(
      new Error("regulal users iren't allowed to hard-delete this account ", {
        cause: 403,
      })
    );
  }

  const user = await deleteOne({
    model: userModel,
    filter: { _id: userId, deletedAt: { $exists: true } },
  });

  if (user.deletedCount) {
    await deleteFolderByPrefix({ prefix: `user/${userId}` });
  }

  return user.deletedCount 
    ? successResponse({ res, data: { user } })
    : next(new Error("not registered user", { cause: 404 }));
});

export const logout = asyncHandler(async (req, res, next) => {
  // console.log(req.decoded);

  await create({
    model: revokeTokenModel,
    data: {
      idToken: req.decoded.jti,
      expiresAccessDate: req.decoded.exp,
      expiresRefreshDate: req.decoded.iat + 31536000,
    },
  });

  return successResponse({ res });
});

export const profileImage = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await uploadFile({
    file: req.file,
    path: `user/${req.user._id}`,
  });
  const user = await findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      picture: { secure_url, public_id },
    },
    options: {
      new: false,
    },
  });

  if (user?.picture?.public_id) {
    await destroyFile({ public_id: user.picture.public_id });
  }

  return successResponse({ res, data: { user } });
});

export const profileCoverImage = asyncHandler(async (req, res, next) => {
  const attachments = await uploadFiles({
    files: req.files,
    path: `user/${req.user._id}/cover`,
  });

  const user = await findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      cover: attachments,
    },
    options: { new: false },
  });

  if (user?.cover?.length) {
    await deleteResources({ public_ids: user.cover.map((el) => el.public_id) });
  }

  return successResponse({ res, data: { user } });
});


