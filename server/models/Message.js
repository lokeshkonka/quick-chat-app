import mongoose, { mongo } from "mongoose";
// This Creates the User Schema 

const messageSchema = new mongoose.Schema({
   senderId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
   receiverId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    text:{type:String,},
    image:{type:String,},
    seen:{type:Boolean,default:false}
},{timestamps:true})
//Mongoose Attaches the message Model 

const Message = mongoose.model("Message",messageSchema);
export default Message;