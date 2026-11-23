const express = require("express");
const { userModel } = require("../model/user.model");
const { postModel } = require("../model/post.model");
const { followModel } = require("../model/follow.model");
const { auth, authorizeRoles } = require("../middlewere/auth.middlewere");
const { formatPost } = require("../utils/crypto");

const adminRouter = express.Router();

// Enforce authentication AND admin role on all admin routes
adminRouter.use(auth);
adminRouter.use(authorizeRoles("admin"));

// 1. ADMIN SYSTEM STATS
adminRouter.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalFollows, recentUsers, recentPosts] = await Promise.all([
      userModel.countDocuments(),
      postModel.countDocuments(),
      followModel.countDocuments(),
      userModel.find().sort({ createdAt: -1 }).limit(5).select("name email handle role createdAt"),
      postModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "name handle email avatar role"),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalFollows,
        recentUsers,
        recentPosts: recentPosts.map(formatPost),
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching admin stats", error: error.message });
  }
});

// 2. LIST ALL USERS WITH PAGINATION & FILTER
adminRouter.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const query = {};
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }, { handle: regex }];
    }

    const totalUsers = await userModel.countDocuments(query);
    const users = await userModel
      .find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching users for admin", error: error.message });
  }
});

// 3. CHANGE USER ROLE (RBAC toggle)
adminRouter.put("/user/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role. Must be 'user' or 'admin'" });
    }

    const user = await userModel.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ msg: "Error updating role", error: error.message });
  }
});

// 4. ADMIN DELETE POST
adminRouter.delete("/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const deleted = await postModel.findByIdAndDelete(postId);
    if (!deleted) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(200).json({ msg: "Post deleted by admin successfully", postId });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting post as admin", error: error.message });
  }
});

// 5. ADMIN DELETE USER
adminRouter.delete("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ msg: "Admin cannot delete their own account from here" });
    }

    await Promise.all([
      userModel.findByIdAndDelete(userId),
      postModel.deleteMany({ author: userId }),
      followModel.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
    ]);

    res.status(200).json({ msg: "User and associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting user", error: error.message });
  }
});

module.exports = { adminRouter };
