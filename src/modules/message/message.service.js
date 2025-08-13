import {
  create,
  deleteOne,
  findById,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../db/models/dbservices.js";
import messageModel from "../../db/models/message.model.js";
import userModel from "../../db/models/user.model.js";
import { uploadFiles } from "../../utils/multer/cloudinary.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { recieverId } = req.params;
  const { content } = req.body;

  const checkUserExsist = await findOne({
    model: userModel,
    filter: {
      _id: recieverId,
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
  });

  if (!checkUserExsist) {
    return next(new Error("invalid reciever", { cause: 404 }));
  }
  let attachments = [];
  if (req.files?.length) {
    attachments = await uploadFiles({
      files: req.files,
      path: `message/${recieverId}`,
    });
  }

  const message = await create({
    model: messageModel,
    data: { content, attachments, recievedBy: recieverId },
  });

  return successResponse({
    res,
    message: "message sent",
    status: 201,
    data: { message },
  });
});

export const getMessageById = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await findOne({
    model: messageModel,
    filter: {
      _id: messageId,
      recievedBy: req.user._id,
    },
  });

  if (!message) {
    return next(new Error("message not found", { cause: 404 }));
  }

  return successResponse({ res, data: { message } });
});

export const freezeMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  // const message = await findOne({model: messageModel,filter: { id: messageId, freezedAt: { $exsists: false } }, });

  const message = await findById({ model: messageModel, id: messageId });

  if (!message) {
    return next(new Error("message not found", { cause: 404 }));
  }

  if (message.freezedAt) {
    return next(new Error("this message is already freezed", { cause: 400 }));
  }

  if (message.recievedBy.toString() !== req.user._id.toString()) {
    return next(
      new Error("you are not the owner of this message", { cause: 403 })
    );
  }

  const updatedMessage = await findOneAndUpdate({
    model: messageModel,
    filter: { _id: messageId },
    data: {
      $set: { freezedAt: Date.now(), freezedBy: req.user._id },
      $inc: { __v: 1 },
    },
  });

  return successResponse({ res, data: { updatedMessage } });
});

export const hardDeleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await findOne({
    model: messageModel,
    filter: { _id: messageId, freezedAt: { $exists: true } },
  });

  if (!message) {
    return next(new Error("message not found", { cause: 404 }));
  }

  if (message.recievedBy.toString() !== req.user._id.toString()) {
    return next(
      new Error("you are not the owner of this message", { cause: 403 })
    );
  }

  if (!message.freezedAt) {
    return next(
      new Error("you must freeze the message before hard deleting it", {
        cause: 400,
      })
    );
  }

  await deleteOne({ model: messageModel, filter: { _id: messageId } });

  return successResponse({ res, message: "message deleted successfully" });
});
