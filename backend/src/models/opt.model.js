import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const otpModel = mongoose.model("otps", otpSchema);
