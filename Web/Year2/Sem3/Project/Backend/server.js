const express = require("express");
const cors = require("cors");

const { connection } = require("./db");
const { userRouter } = require("./routes/user.route");
const { messageRouter } = require("./routes/message.route");
const { auth } = require("./middlewere/auth.middlewere");

const app = express();

// Enable Cross-Origin Resource Sharing for Netlify frontend
app.use(cors({ origin: "*" }));
app.use(express.json());

// Ensure MongoDB Atlas connection on every serverless request
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

app.get("/", (req, res) => {
  res.send("HOME Page");
});

// Middleware
app.use(auth);

// Private route
app.get("/dashboard", (req, res) => {
  res.send("Private Route");
});

// Only listen when running as a standalone server (local dev)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, async () => {
    try {
      await connection();
      console.log("DB Connected");
    } catch (error) {
      console.log(error);
    }
    console.log(`Server started on port ${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
