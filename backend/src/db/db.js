import mongoose from "mongoose";
import { MongoDb_ATLAS } from "../constant/constant.js";



export const connectDb = async()=>{
    const connection = await mongoose.connect(MongoDb_ATLAS);
}