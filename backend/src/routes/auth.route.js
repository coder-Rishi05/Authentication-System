import { Router } from "express";
import { register,getMe } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register",register);
authRouter.get("/getme",getMe);


export default authRouter;