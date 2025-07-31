import mongoose from "mongoose";

export let genderEnum = { male: "male", female: "female" };
export let roleEnum = { user: "User", admin: "Admin" };
export let providerEnum = { google: "google", system: "system" };

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: [
        20,
        "first name must be less than 20 characters and you have entered{VALUE} characters",
      ],
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: [
        20,
        "lastName must be less than 20 characters and you have entered{VALUE} characters",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },

    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: `gender only allow ${Object.values(genderEnum)} `,
      },
      default: genderEnum.male,
    },

    role: {
      type: String,
      enum: {
        values: Object.values(roleEnum),
        message: `role only allow ${Object.values(roleEnum)} `,
      },
      default: roleEnum.user,
    },
    provider: {
      type: String,
      enum: {
        values: Object.values(providerEnum),
        message: `provider only allow ${Object.values(providerEnum)}`,
      },
      default: providerEnum.system,
    },
    confirmHashedOtp: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    phone: {
      type: String,
    },
    picture: String,
    cover: [String],
    forgotCode: String,
    confirmEmail: Date,
    otpCreatedAt: Date,
    freezedAt: Date,
    changeLoginCredentials: Date,
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    freezedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    otpFailedAttempts: {
      type: Number,
      default: 0,
    },
    otpBanUntil: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} +" "+ ${this.lastName}`;
  });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;

userModel.syncIndexes();
