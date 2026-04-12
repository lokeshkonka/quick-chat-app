import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketmap } from "../server.js"; // <- IMPORT userSocketmap

// Get all users except logged-in user
export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id || req.user_id;

    // Find all users except current logged in user
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // Count unseen messages per user
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error, " THE ERROR IN THE MESSAGE CONTROLLER");
    res.json({ success: false, message: error.message });
  }
};

// Get all messages between logged-in user and selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message, "ERROR IN THE GETMESSAGES");
    res.json({ success: false, message: error.message });
  }
};

// Mark message as seen by id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message, "ERROR IN THE SEEN MESSAGE");
    res.json({ success: false, message: error.message });
  }
};

// Send message to a user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // --- SAFETY: normalize keys to string ---
    const rid = receiverId?.toString?.() ?? receiverId;
    // read from map safely
    const receiverSocketId = userSocketmap && userSocketmap[rid];

    // Debug log (remove in production if noisy)
    // console.log("userSocketmap:", userSocketmap, "receiverSocketId:", receiverSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      // receiver offline — optionally handle push/notification
      // console.log("Receiver offline, socket not found for:", rid);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message, "ERROR IS IN THE NEW MESSAGE");
    res.json({ success: false, message: error.message });
  }
};
