const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true }, // sender email
    receiver: { type: String, required: true }, // receiver email
    text: { type: String, required: true },
    status: { type: String, default: "sent" },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("message", messageSchema);

module.exports = { messageModel };
