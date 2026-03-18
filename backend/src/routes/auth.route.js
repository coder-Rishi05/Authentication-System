import { Router } from "express";
import { register,getMe,refreshToken, logout } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register",register);
authRouter.get("/getme",getMe);
authRouter.get("/refreshToken",refreshToken);
authRouter.get("/logout",logout);


export default authRouter;