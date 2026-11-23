const express = require("express");
const { postModel } = require("../model/post.model");
const { followModel } = require("../model/follow.model");
const { auth } = require("../middlewere/auth.middlewere");
const { encryptText, formatPost } = require("../utils/crypto");

const postRouter = express.Router();

// Helper to extract hashtags from post content
const extractHashtags = (text) => {
  if (!text) return [];
  const regex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(regex);
  if (!matches) return [];
  // Clean off '#' and lowercase, deduplicate
  return [...new Set(matches.map((tag) => tag.substring(1).toLowerCase()))];
};

// 1. CREATE A POST (Max 280 chars, encrypted in MongoDB)
postRouter.post("/create", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ msg: "Post content cannot be empty" });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > 280) {
      return res.status(400).json({ msg: "Post exceeds the 280 character limit" });
    }

    const hashtags = extractHashtags(trimmedContent);

    // Encrypt post content like a password hash before saving to MongoDB Atlas
    const encryptedContent = encryptText(trimmedContent);

    const newPost = new postModel({
      author: req.user.id,
      content: encryptedContent,
      hashtags,
      likes: [],
      replies: [],
    });

    await newPost.save();

    const populatedPost = await postModel
      .findById(newPost._id)
      .populate("author", "name email handle avatar role")
      .populate("replies.user", "name email handle avatar role");

    const formattedPost = formatPost(populatedPost);

    // Live "new posts" badge through Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("new_post", formattedPost);
    }

    res.status(201).json({
      msg: "Post created successfully",
      post: formattedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ msg: "Error creating post", error: error.message });
  }
});

// 2. UNIQUE TWIST: TRENDING HASHTAGS OF THE LAST 24 HOURS (TOP 5) USING AGGREGATION
postRouter.get("/trending", async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const trending = await postModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last24h },
          hashtags: { $exists: true, $not: { $size: 0 } },
        },
      },
      { $unwind: "$hashtags" },
      {
        $group: {
          _id: "$hashtags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      trending: trending.map((item) => ({
        tag: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    console.error("Trending aggregation error:", error);
    res.status(500).json({ msg: "Error calculating trending hashtags", error: error.message });
  }
});

// 3. HOME FEED OF FOLLOWED USERS WITH PAGINATION
postRouter.get("/feed", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all users current user follows
    const follows = await followModel.find({ follower: req.user.id }).select("following");
    const followingIds = follows.map((f) => f.following);

    // Feed includes followed users' posts AND the user's own posts
    const feedAuthors = [...followingIds, req.user.id];

    const totalPosts = await postModel.countDocuments({ author: { $in: feedAuthors } });

    const posts = await postModel
      .find({ author: { $in: feedAuthors } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email handle avatar role")
      .populate("replies.user", "name email handle avatar role");

    res.status(200).json({
      posts: posts.map(formatPost),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ msg: "Error fetching home feed", error: error.message });
  }
});

// 4. EXPLORE FEED (ALL POSTS) WITH PAGINATION
postRouter.get("/explore", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await postModel.countDocuments();
    const posts = await postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email handle avatar role")
      .populate("replies.user", "name email handle avatar role");

    res.status(200).json({
      posts: posts.map(formatPost),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts,
    });
  } catch (error) {
    console.error("Explore error:", error);
    res.status(500).json({ msg: "Error fetching explore feed", error: error.message });
  }
});

// 5. POSTS BY HASHTAG
postRouter.get("/hashtag/:tag", async (req, res) => {
  try {
    const rawTag = req.params.tag.toLowerCase().replace(/^#/, "");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { hashtags: rawTag };
    const totalPosts = await postModel.countDocuments(query);

    const posts = await postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email handle avatar role")
      .populate("replies.user", "name email handle avatar role");

    res.status(200).json({
      tag: rawTag,
      posts: posts.map(formatPost),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching hashtag posts", error: error.message });
  }
});

// 6. POSTS BY USER
postRouter.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await postModel.countDocuments({ author: userId });
    const posts = await postModel
      .find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email handle avatar role")
      .populate("replies.user", "name email handle avatar role");

    res.status(200).json({
      posts: posts.map(formatPost),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user posts", error: error.message });
  }
});

// 7. LIKE / UNLIKE A POST
postRouter.post("/:postId/like", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const userIdStr = req.user.id.toString();
    const likedIndex = post.likes.findIndex((id) => id.toString() === userIdStr);

    let isLiked = false;
    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
      isLiked = false;
    } else {
      post.likes.push(req.user.id);
      isLiked = true;
    }

    await post.save();

    res.status(200).json({
      msg: isLiked ? "Post liked" : "Post unliked",
      isLiked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error toggling like", error: error.message });
  }
});

// 8. ADD REPLY (Max 280 chars, encrypted in MongoDB)
postRouter.post("/:postId/reply", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ msg: "Reply content cannot be empty" });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > 280) {
      return res.status(400).json({ msg: "Reply exceeds 280 character limit" });
    }

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Encrypt reply text in MongoDB
    const encryptedReply = encryptText(trimmedContent);

    post.replies.push({
      user: req.user.id,
      content: encryptedReply,
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await postModel
      .findById(postId)
      .populate("author", "name email handle avatar role")
      .populate("replies.user", "name email handle avatar role");

    const formattedPost = formatPost(updatedPost);

    res.status(201).json({
      msg: "Reply added successfully",
      replies: formattedPost.replies,
      repliesCount: formattedPost.replies.length,
      post: formattedPost,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error adding reply", error: error.message });
  }
});

// 9. DELETE POST (Author or Admin)
postRouter.delete("/:postId", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const isAuthor = post.author.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ msg: "Unauthorized: You can only delete your own posts" });
    }

    await postModel.findByIdAndDelete(postId);

    res.status(200).json({ msg: "Post deleted successfully", postId });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting post", error: error.message });
  }
});

module.exports = { postRouter };
