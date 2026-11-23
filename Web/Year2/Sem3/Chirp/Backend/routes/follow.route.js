const express = require("express");
const { followModel } = require("../model/follow.model");
const { userModel } = require("../model/user.model");
const { auth } = require("../middlewere/auth.middlewere");

const followRouter = express.Router();

// 1. FOLLOW A USER
followRouter.post("/:targetUserId", auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User to follow not found" });
    }

    // Check if already following
    const existing = await followModel.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    if (existing) {
      return res.status(400).json({ msg: "You are already following this user", isFollowing: true });
    }

    const newFollow = new followModel({
      follower: currentUserId,
      following: targetUserId,
    });

    await newFollow.save();

    const [followersCount, followingCount] = await Promise.all([
      followModel.countDocuments({ following: targetUserId }),
      followModel.countDocuments({ follower: targetUserId }),
    ]);

    res.status(200).json({
      msg: `Now following @${targetUser.handle || targetUser.name}`,
      isFollowing: true,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ msg: "Error following user", error: error.message });
  }
});

// 2. UNFOLLOW A USER
followRouter.delete("/:targetUserId", auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;

    const followDoc = await followModel.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    if (!followDoc) {
      return res.status(400).json({ msg: "You are not following this user", isFollowing: false });
    }

    const [followersCount, followingCount] = await Promise.all([
      followModel.countDocuments({ following: targetUserId }),
      followModel.countDocuments({ follower: targetUserId }),
    ]);

    res.status(200).json({
      msg: "Unfollowed successfully",
      isFollowing: false,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ msg: "Error unfollowing user", error: error.message });
  }
});

// 3. CHECK FOLLOW STATUS
followRouter.get("/:targetUserId/status", auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const followDoc = await followModel.findOne({
      follower: req.user.id,
      following: targetUserId,
    });

    res.status(200).json({
      isFollowing: !!followDoc,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error checking follow status", error: error.message });
  }
});

// 4. LIST FOLLOWERS OF A USER
followRouter.get("/:targetUserId/followers", async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const followers = await followModel
      .find({ following: targetUserId })
      .populate("follower", "name email handle avatar bio role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      followers: followers.map((f) => f.follower).filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching followers", error: error.message });
  }
});

// 5. LIST USERS A USER IS FOLLOWING
followRouter.get("/:targetUserId/following", async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const following = await followModel
      .find({ follower: targetUserId })
      .populate("following", "name email handle avatar bio role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      following: following.map((f) => f.following).filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching following", error: error.message });
  }
});

module.exports = { followRouter };
