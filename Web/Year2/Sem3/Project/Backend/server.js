const express = require("express");

const { connection } = require("./db");
const { userRouter } = require("./routes/user.route");
const { messageRouter } = require("./routes/message.route");
const { auth } = require("./middlewere/auth.middlewere");

const app = express();
app.use(express.json());

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

app.listen(8080, async () => {
  try {
    await connection;
    console.log("DB Connected");
  } catch (error) {
    console.log(error);
  }
  console.log("Server started");
});
