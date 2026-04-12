import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

export const userSocketmap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  // Get userId from query string
  const userId = socket.handshake.query.userId; // must match frontend key

  if (userId) {
    userSocketmap[userId] = socket.id;
  }

  // Emit updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketmap));

  // On disconnect
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketmap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketmap));
  });
});

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/status", (req, res) => res.send("SERVER IS LIVE"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// MongoDB connection
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("SERVER IS RUNNING ON PORT", PORT));
