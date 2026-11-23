const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { connection } = require("./db");
const { userRouter } = require("./routes/user.route");
const { postRouter } = require("./routes/post.route");
const { followRouter } = require("./routes/follow.route");
const { adminRouter } = require("./routes/admin.route");
const { messageRouter } = require("./routes/message.route");
const { groupRouter } = require("./routes/group.route");
const { auth } = require("./middlewere/auth.middlewere");

const app = express();
const httpServer = http.createServer(app);

// Socket.IO setup for live "new posts" badges and real-time updates
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Provide io instance to Express routes
app.set("io", io);

// Track online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("WebSocket client connected. Socket ID:", socket.id);

  socket.on("user_connected", (userEmail) => {
    if (!userEmail) return;
    const email = userEmail.trim().toLowerCase();
    socket.userEmail = email;

    if (!onlineUsers.has(email)) {
      onlineUsers.set(email, new Set());
    }
    onlineUsers.get(email).add(socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    const email = socket.userEmail;
    if (email && onlineUsers.has(email)) {
      const userSockets = onlineUsers.get(email);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(email);
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
    console.log("WebSocket client disconnected. Socket ID:", socket.id);
  });
});

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());

// Ensure MongoDB Atlas connection on every request
app.use(async (req, res, next) => {
  try {
    await connection();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ msg: "Database connection failed", error: error.message });
  }
});

// Public & Feature Routes
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/follow", followRouter);
app.use("/admin", adminRouter);

// Retain chat endpoints for compatibility
app.use("/message", messageRouter);
app.use("/group", groupRouter);

app.get("/", (req, res) => {
  res.json({
    app: "Chirp – Twitter Clone API",
    status: "online",
    timestamp: new Date().toISOString(),
    endpoints: {
      user: "/user",
      post: "/post",
      follow: "/follow",
      admin: "/admin",
      trending: "/post/trending",
    },
  });
});

// Protected test route
app.get("/dashboard", auth, (req, res) => {
  res.json({ msg: "Private Route Accessible", user: req.user });
});

// Server listener
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, async () => {
  try {
    await connection();
    console.log("DB Connected successfully to Chirp Database");
  } catch (error) {
    console.log("Database connection error:", error);
  }
  console.log(`Chirp Server running on port ${PORT} (HTTP & WebSocket)`);
});

module.exports = app;
