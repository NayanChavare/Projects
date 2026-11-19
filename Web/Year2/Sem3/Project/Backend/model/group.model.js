const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    creator: { type: String, required: true }, // creator email
    members: { type: [String], required: true }, // array of member emails
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

const groupModel = mongoose.model("group", groupSchema);

module.exports = { groupModel };
