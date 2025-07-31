import mongoose from "mongoose";

const revokeTokenSchema = new mongoose.Schema(
  {
    idToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAccessDate: { type: Number, required: true },
    expiresRefreshDate: { type: Number, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const revokeTokenModel =
  mongoose.models.RevokeToken ||
  mongoose.model("RevokeToken", revokeTokenSchema);

export default revokeTokenModel;

revokeTokenModel.syncIndexes();
