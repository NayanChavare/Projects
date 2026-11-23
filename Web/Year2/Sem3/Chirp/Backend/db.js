const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

const connection = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  if (!process.env.mongourl) {
    throw new Error("Missing 'mongourl' environment variable");
  }
  await mongoose.connect(process.env.mongourl);
  isConnected = true;
};

// Also trigger connection immediately if running locally
connection().catch((err) => console.log("DB Connection warning:", err.message));

module.exports = { connection };
