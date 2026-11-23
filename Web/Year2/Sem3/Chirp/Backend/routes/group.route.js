const express = require("express");
const mongoose = require("mongoose");
const { groupModel } = require("../model/group.model");
const { messageModel } = require("../model/message.model");
const { decryptText } = require("./message.route");

const groupRouter = express.Router();

// Create a new chat group
groupRouter.post("/create", async (req, res) => {
  const { name, description, members, creator } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send({ msg: "Group name is required" });
  }

  if (!creator || !creator.trim()) {
    return res.status(400).send({ msg: "Creator email is required" });
  }

  const creatorEmail = creator.trim().toLowerCase();
  let memberList = Array.isArray(members)
    ? members.map((m) => (typeof m === "string" ? m.trim().toLowerCase() : m.email?.trim().toLowerCase()))
    : [];

  // Ensure creator is included in the members list
  if (!memberList.includes(creatorEmail)) {
    memberList.push(creatorEmail);
  }

  // Remove duplicates
  memberList = Array.from(new Set(memberList.filter(Boolean)));

  try {
    const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.trim())}`;

    const newGroup = new groupModel({
      name: name.trim(),
      description: description ? description.trim() : "",
      creator: creatorEmail,
      members: memberList,
      avatar,
    });

    await newGroup.save();

    // Broadcast new group event over WebSocket
    const io = req.app.get("io");
    if (io) {
      io.emit("group_created", newGroup);
    }

    res.status(201).send({ msg: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).send({ msg: "Failed to create group", error: error.message });
  }
});

// Fetch all groups that the user is a member of
groupRouter.get("/list", async (req, res) => {
  const { email } = req.query;

  if (!email || !email.trim()) {
    return res.status(400).send({ msg: "Email is required", groups: [] });
  }

  const userEmail = email.trim().toLowerCase();

  try {
    const groups = await groupModel.find({ members: userEmail }).sort({ updatedAt: -1 });

    // Fetch last message for each group
    const groupsWithLastMessage = await Promise.all(
      groups.map(async (grp) => {
        const lastMsg = await messageModel
          .findOne({ groupId: grp._id.toString() })
          .sort({ createdAt: -1 });

        const grpObj = grp.toObject();
        if (lastMsg) {
          grpObj.lastMessage = decryptText(lastMsg.text);
          grpObj.lastMessageTime = lastMsg.createdAt;
          grpObj.lastSender = lastMsg.sender;
        } else {
          grpObj.lastMessage = "Group created";
          grpObj.lastMessageTime = grp.createdAt;
          grpObj.lastSender = "";
        }
        return grpObj;
      })
    );

    res.send({ groups: groupsWithLastMessage });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).send({ msg: "Failed to fetch groups", error: error.message, groups: [] });
  }
});

// Fetch all messages in a group
groupRouter.get("/:id/messages", async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ msg: "Valid group ID is required", messages: [] });
  }

  try {
    const messages = await messageModel
      .find({
        $or: [{ groupId: id }, { receiver: id, isGroup: true }],
      })
      .sort({ createdAt: 1 });

    const decryptedMessages = messages.map((m) => {
      const obj = m.toObject();
      obj.text = decryptText(m.text);
      obj.reactions = Array.isArray(m.reactions) ? m.reactions : [];
      return obj;
    });

    res.send({ messages: decryptedMessages });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).send({ msg: "Failed to fetch group messages", error: error.message, messages: [] });
  }
});

// Add a member to an existing group
groupRouter.post("/:id/add-member", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!id || !mongoose.Types.ObjectId.isValid(id) || !email || !email.trim()) {
    return res.status(400).send({ msg: "Group ID and member email are required" });
  }

  try {
    const group = await groupModel.findById(id);
    if (!group) {
      return res.status(404).send({ msg: "Group not found" });
    }

    const newMemberEmail = email.trim().toLowerCase();
    if (!group.members.includes(newMemberEmail)) {
      group.members.push(newMemberEmail);
      await group.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("group_updated", group);
      }
    }

    res.send({ msg: "Member added successfully", group });
  } catch (error) {
    console.error("Error adding member to group:", error);
    res.status(500).send({ msg: "Failed to add member", error: error.message });
  }
});

module.exports = { groupRouter };
