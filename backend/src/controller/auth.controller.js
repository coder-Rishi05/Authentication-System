import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { jwt_secret } from "../constant/constant.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(404).json({ message: "All feilds are required" });
    }

    const isAlreadyExist = await userModel.findOne({
      $or: [{ username, email }],
    });

    if (isAlreadyExist) {
      return res.status(409).json({ message: "User already exist" });
    }

    const hasspwd = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hasspwd,
    });

    const acessToken = jwt.sign({ id: user._id }, jwt_secret, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user._id }, jwt_secret, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // client side js cant read cookie
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "user registered sucessfully",
      user: {
        name: user.username,
        email: user.email,
      },
      acessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.send("token not found");
    }

    const decode = jwt.verify(token, jwt_secret);

    const userId = decode.id;

    const user = await userModel.findById(userId);

    console.log(user);

    return res.status(200).json({ message: "Login user is ", user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

// to generate new acess token
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  const decoded = jwt.verify(refreshToken, jwt_secret);

  const accessToken = jwt.sign({ id: decoded.id }, jwt_secret, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign({ id: decoded.id }, jwt_secret, {
    expiresIn: "7d",
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res
    .status(200)
    .json({ message: "Access token refreshed successfully", accessToken });
};

export const login = async () => {};

export const logout = async () => {};
