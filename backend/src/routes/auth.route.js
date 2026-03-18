import { Router } from "express";
import { register,getMe,refreshToken } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register",register);
authRouter.get("/getme",getMe);
authRouter.get("/refreshToken",refreshToken);


export default authRouter;