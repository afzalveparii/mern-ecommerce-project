import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB: string = process.env.DATABASE! || "";

mongoose.set('strictQuery', false);

const connection = mongoose.connect(DB); 
export default mongoose.connection;