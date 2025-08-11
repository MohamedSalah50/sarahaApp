import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    attachments: [{ secure_url: String, public_id: String }],
    content: {
      type: String,
      required: function () {
        return this.attachments?.length < 1 ? true : false;
      },
      minLength: 2,
      maxLength: [2000, "content max count is 2000"],
    },
    recievedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true
    },
  },
  { timestamps: true }
);

const messageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
export default messageModel;
