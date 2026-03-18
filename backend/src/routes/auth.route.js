import { Router } from "express";
import { register,getMe,logoutAll,refreshToken, logout, login } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.get("/getme",getMe);
authRouter.get("/refreshToken",refreshToken);
authRouter.get("/logout",logout);
authRouter.get("/logoutAll",logoutAll);


export default authRouter;