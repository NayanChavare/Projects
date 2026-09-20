// app.js
// Main file of the project. Here we create the Express server,
// use the middlewares and connect the student routes.

const express = require("express");
const logger = require("./middleware/logger");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = 3000;

// built-in middleware to read JSON data coming from the body
app.use(express.json());

// our custom logger middleware
app.use(logger);

// simple home route just to check if server is running
app.get("/", (req, res) => {
  res.status(200).json({ message: "Student Management REST API is running" });
});

// modular routing -> all /students routes come from studentRoutes.js
app.use("/students", studentRoutes);

// if no route matches, send 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handling middleware (runs if something breaks in the server)
app.use((err, req, res, next) => {
  console.log("Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
