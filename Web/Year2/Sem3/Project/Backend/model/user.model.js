const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, default: "" },
  phone: { type: String, default: "" },
  firebaseUid: { type: String, default: "" },
  authProvider: { type: String, default: "local" }, // "local", "google", "phone"
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
