const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true }, // sender email
    receiver: { type: String, required: true }, // receiver email or groupId
    groupId: { type: String, default: null }, // group ID if this is a group message
    isGroup: { type: Boolean, default: false },
    senderName: { type: String, default: "" }, // cached display name of sender
    text: { type: String, required: true },
    status: { type: String, default: "sent" },
    reactions: { type: [String], default: [] },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("message", messageSchema);

module.exports = { messageModel };
