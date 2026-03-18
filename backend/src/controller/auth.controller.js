import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { jwt_secret } from "../constant/constant.js";
import sessionModel from "../models/session.model.js";
import crypto from "node:crypto";

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

    const refreshToken = jwt.sign({ id: user._id }, jwt_secret, {
      expiresIn: "7d",
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash: refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const acessToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      jwt_secret,
      {
        expiresIn: "15m",
      },
    );

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

  const decoded = await jwt.verify(refreshToken, jwt_secret);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const accessToken = jwt.sign({ id: decoded.id }, jwt_secret, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign({ id: decoded.id }, jwt_secret, {
    expiresIn: "7d",
  });

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(403).json({ message: "Invalid credential" });
    }

    const refreshToken = await jwt.sign({ id: user._id }, jwt_secret, {
      expiresIn: "7d",
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = await jwt.sign(
      { id: user._id, sessionId: session._id },
      jwt_secret,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res
      .status(200)
      .json({ message: "User login successfully", user, accessToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "token not found" });
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

export const logoutAll = async (req,res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, jwt_secret);

    await sessionModel.updateMany(
      {
        user: decoded.id,
        revoked: false,
      },
      {
        revoked: true,
      },
    );

    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json({ message: "Logout from all devices successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};
