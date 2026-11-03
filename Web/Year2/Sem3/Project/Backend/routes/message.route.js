const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { messageModel } = require("../model/message.model");
const { userModel } = require("../model/user.model");

const messageRouter = express.Router();

// 256-bit encryption key derived from environment or secure project secret
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "pulsechat_database_message_encryption_key_2026";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest(); // 32 bytes

/**
 * Encrypt plaintext using AES-256-CBC with a random 16-byte initialization vector (IV)
 * Format stored in MongoDB: <iv_hex>:<encrypted_hex>
 */
function encryptText(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
}

/**
 * Decrypt ciphertext stored in MongoDB
 */
function decryptText(cipherText) {
  if (!cipherText || typeof cipherText !== "string") return cipherText;
  try {
    const parts = cipherText.split(":");
    // If not matching iv:encrypted format, return as-is (e.g. unencrypted legacy messages)
    if (parts.length !== 2 || parts[0].length !== 32) return cipherText;

    const iv = Buffer.from(parts[0], "hex");
    const encryptedData = parts[1];
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return cipherText;
  }
}

// Save a new chat message in MongoDB Atlas (with AES-256-CBC encryption)
messageRouter.post("/send", async (req, res) => {
  const { sender, receiver, text } = req.body;

  if (!sender || !receiver || !text || !text.trim()) {
    return res.status(400).send({ msg: "Sender, receiver, and message text are required" });
  }

  try {
    const encryptedText = encryptText(text.trim());

    const newMessage = new messageModel({
      sender: sender.trim().toLowerCase(),
      receiver: receiver.trim().toLowerCase(),
      text: encryptedText, // Encrypted ciphertext stored in MongoDB Atlas
      status: "delivered",
      reactions: [],
    });

    await newMessage.save();

    // Return message with decrypted text for client convenience
    const responseObj = newMessage.toObject();
    responseObj.text = text.trim();
    responseObj.reactions = [];

    res.status(201).send({ msg: "Message saved securely to MongoDB", message: responseObj });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).send({ msg: "Failed to save message to MongoDB", error: error.message });
  }
});

// Fetch all messages in a conversation between two users from MongoDB Atlas
messageRouter.get("/conversation", async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).send({ msg: "Both user1 and user2 emails are required", messages: [] });
  }

  const u1 = user1.trim().toLowerCase();
  const u2 = user2.trim().toLowerCase();

  try {
    const messages = await messageModel
      .find({
        $or: [
          { sender: u1, receiver: u2 },
          { sender: u2, receiver: u1 },
        ],
      })
      .sort({ createdAt: 1 });

    // Decrypt messages for authorized conversation participants
    const decryptedMessages = messages.map((m) => {
      const obj = m.toObject();
      obj.text = decryptText(m.text);
      obj.reactions = Array.isArray(m.reactions) ? m.reactions : [];
      return obj;
    });

    res.send({ messages: decryptedMessages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).send({ msg: "Failed to fetch messages", error: error.message, messages: [] });
  }
});

// Toggle an emoji reaction on a message in MongoDB Atlas
const handleReaction = async (req, res) => {
  const { messageId, emoji } = req.body;

  if (!messageId || !emoji) {
    return res.status(400).send({ msg: "messageId and emoji are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).send({ msg: "Invalid message ID format" });
  }

  try {
    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).send({ msg: "Message not found" });
    }

    const currentReactions = Array.isArray(message.reactions) ? [...message.reactions] : [];
    const index = currentReactions.indexOf(emoji);

    if (index > -1) {
      // Emoji already present: toggle off (remove)
      currentReactions.splice(index, 1);
    } else {
      // Emoji not present: toggle on (add)
      currentReactions.push(emoji);
    }

    message.reactions = currentReactions;
    await message.save();

    res.send({
      msg: "Reaction updated successfully",
      messageId: message._id,
      reactions: message.reactions,
    });
  } catch (error) {
    console.error("Error updating reaction:", error);
    res.status(500).send({ msg: "Failed to update reaction", error: error.message });
  }
};

messageRouter.patch("/react", handleReaction);
messageRouter.post("/react", handleReaction);

// Delete conversation between two users from MongoDB Atlas
messageRouter.delete("/conversation", async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).send({ msg: "Both user1 and user2 emails are required" });
  }

  const u1 = user1.trim().toLowerCase();
  const u2 = user2.trim().toLowerCase();

  try {
    const result = await messageModel.deleteMany({
      $or: [
        { sender: u1, receiver: u2 },
        { sender: u2, receiver: u1 },
      ],
    });

    res.send({ msg: "Conversation deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).send({ msg: "Failed to delete conversation", error: error.message });
  }
});

// Fetch all conversation threads/partners for a user from MongoDB Atlas
messageRouter.get("/threads", async (req, res) => {
  const { email } = req.query;

  if (!email || !email.trim()) {
    return res.status(400).send({ msg: "User email is required", threads: [] });
  }

  const userEmail = email.trim().toLowerCase();

  try {
    // Find all messages involving this user
    const messages = await messageModel
      .find({
        $or: [{ sender: userEmail }, { receiver: userEmail }],
      })
      .sort({ createdAt: -1 });

    // Group by contact email
    const contactMap = new Map();

    for (const msg of messages) {
      const contactEmail = msg.sender === userEmail ? msg.receiver : msg.sender;
      if (!contactMap.has(contactEmail)) {
        contactMap.set(contactEmail, {
          email: contactEmail,
          lastMessage: decryptText(msg.text), // Decrypted snippet for thread preview
          lastMessageTime: msg.createdAt,
          lastSender: msg.sender,
        });
      }
    }

    // Resolve contact names from userModel
    const contactEmails = Array.from(contactMap.keys());
    const users = await userModel.find({ email: { $in: contactEmails } }, "name email");
    const nameMap = new Map(users.map((u) => [u.email.toLowerCase(), u.name]));

    const threads = contactEmails.map((cEmail) => {
      const details = contactMap.get(cEmail);
      return {
        ...details,
        name: nameMap.get(cEmail) || cEmail.split("@")[0],
      };
    });

    res.send({ threads });
  } catch (error) {
    console.error("Error fetching threads:", error);
    res.status(500).send({ msg: "Failed to fetch threads", error: error.message, threads: [] });
  }
});

module.exports = { messageRouter };
