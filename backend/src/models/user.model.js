import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "UserName is required"],
  },
  email: {
    type: String,
    require: [true, "Email is required"],
    unique: [true, "email must be unique"],
  },
  password: {
    type: String,
    require: [true, "password is required"],
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
