const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { connection } = require("./db");
const { userRouter } = require("./routes/user.route");
const { messageRouter, encryptText } = require("./routes/message.route");
const { groupRouter } = require("./routes/group.route");
const { messageModel } = require("./model/message.model");
const { auth } = require("./middlewere/auth.middlewere");

const app = express();
const httpServer = http.createServer(app);

// Simple Socket.io setup for continuous WebSocket connection (as in Week7)
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Provide io instance to Express routes
app.set("io", io);

// Track online users: email (lowercase) -> Set of active socket IDs
const onlineUsers = new Map();

// WebSocket event handling (Week7 style)
let connectedCount = 0;
io.on("connection", (socket) => {
  connectedCount++;
  console.log("WebSocket client connected. Total connected sockets:", connectedCount);

  // Send initial online users list to the newly connected socket
  socket.emit("online_users", Array.from(onlineUsers.keys()));

  // User identifies their email when logging in / opening the app
  socket.on("user_connected", (userEmail) => {
    if (!userEmail) return;
    const email = userEmail.trim().toLowerCase();
    socket.userEmail = email;

    if (!onlineUsers.has(email)) {
      onlineUsers.set(email, new Set());
    }
    onlineUsers.get(email).add(socket.id);

    // Broadcast updated online users list to all connected clients
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  // Real-time direct message receiver over WebSocket
  socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, text, isGroup, groupId, senderName } = data;
      if (!sender || !text || !text.trim()) return;

      const encryptedText = encryptText(text.trim());

      if (isGroup || groupId || !receiver || !receiver.includes("@")) {
        // Group chat message
        const targetGroup = (groupId || receiver).toString();
        const newGroupMsg = new messageModel({
          sender: sender.trim().toLowerCase(),
          receiver: targetGroup,
          groupId: targetGroup,
          isGroup: true,
          senderName: senderName || sender.split("@")[0],
          text: encryptedText,
          status: "delivered",
          reactions: [],
        });

        await newGroupMsg.save();

        const responseObj = newGroupMsg.toObject();
        responseObj.text = text.trim();
        responseObj.reactions = [];

        // Broadcast to all clients in real-time
        io.emit("receive_group_message", responseObj);
      } else {
        // Direct 1-on-1 message
        if (!receiver || !receiver.includes("@")) return;
        const newMessage = new messageModel({
          sender: sender.trim().toLowerCase(),
          receiver: receiver.trim().toLowerCase(),
          isGroup: false,
          groupId: null,
          text: encryptedText,
          status: "delivered",
          reactions: [],
        });

        await newMessage.save();

        const responseObj = newMessage.toObject();
        responseObj.text = text.trim();
        responseObj.reactions = [];

        // Broadcast new message in real time to all connected clients
        io.emit("receive_message", responseObj);
      }
    } catch (err) {
      console.error("WebSocket send_message error:", err);
    }
  });

  // Dedicated group message event
  socket.on("send_group_message", async (data) => {
    try {
      const { sender, groupId, text, senderName } = data;
      if (!sender || !groupId || !text || !text.trim()) return;

      const encryptedText = encryptText(text.trim());
      const newGroupMsg = new messageModel({
        sender: sender.trim().toLowerCase(),
        receiver: groupId,
        groupId: groupId,
        isGroup: true,
        senderName: senderName || sender.split("@")[0],
        text: encryptedText,
        status: "delivered",
        reactions: [],
      });

      await newGroupMsg.save();

      const responseObj = newGroupMsg.toObject();
      responseObj.text = text.trim();
      responseObj.reactions = [];

      io.emit("receive_group_message", responseObj);
    } catch (err) {
      console.error("WebSocket send_group_message error:", err);
    }
  });

  // Real-time reaction update over WebSocket
  socket.on("react_message", async ({ messageId, emoji }) => {
    try {
      if (!messageId || !emoji) return;
      const message = await messageModel.findById(messageId);
      if (!message) return;

      const currentReactions = Array.isArray(message.reactions) ? [...message.reactions] : [];
      const index = currentReactions.indexOf(emoji);
      if (index > -1) {
        currentReactions.splice(index, 1);
      } else {
        currentReactions.push(emoji);
      }
      message.reactions = currentReactions;
      await message.save();

      io.emit("reaction_updated", {
        messageId: message._id,
        reactions: message.reactions,
      });
    } catch (err) {
      console.error("WebSocket react_message error:", err);
    }
  });

  // Real-time typing notification over WebSocket
  socket.on("typing", (data) => {
    socket.broadcast.emit("user_typing", data);
  });

  // Client disconnection handling
  socket.on("disconnect", () => {
    connectedCount--;
    const email = socket.userEmail;
    if (email && onlineUsers.has(email)) {
      const userSockets = onlineUsers.get(email);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(email);
      }
      // Broadcast updated online users list
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
    console.log("WebSocket client disconnected. Total connected sockets:", connectedCount);
  });
});

// Enable Cross-Origin Resource Sharing for Netlify frontend
app.use(cors({ origin: "*" }));
app.use(express.json());

// Ensure MongoDB Atlas connection on every request
app.use(async (req, res, next) => {
  try {
    await connection();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).send({ msg: "Database connection failed", error: error.message });
  }
});

app.use("/user", userRouter);
app.use("/message", messageRouter);
app.use("/group", groupRouter);

app.get("/", (req, res) => {
  res.send("HOME Page - PulseChat WebSocket Server Active");
});

// Middleware
app.use(auth);

// Private route
app.get("/dashboard", (req, res) => {
  res.send("Private Route");
});

// Server listener for cloud platforms (Render, Railway, etc.) & local dev
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, async () => {
  try {
    await connection();
    console.log("DB Connected successfully");
  } catch (error) {
    console.log("Database connection error:", error);
  }
  console.log(`Server running on port ${PORT} (HTTP & WebSocket)`);
});

// Export for Vercel Serverless
module.exports = app;
