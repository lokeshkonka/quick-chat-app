import mongoose from "mongoose";

export const connectDB =async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);

    } catch (error) {
        console.error("ERROR IN MONGODB CONNECTION",error);
    }
}










