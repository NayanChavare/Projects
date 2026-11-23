const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { userModel } = require("../model/user.model");
const { followModel } = require("../model/follow.model");
const { postModel } = require("../model/post.model");
const { auth } = require("../middlewere/auth.middlewere");

const userRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "coding";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "chirp_refresh_secret_key";

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role || "user",
    handle: user.handle,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// 1. REGISTER
userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, bio, handle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please provide name, email, and password" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingEmail = await userModel.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({ msg: "Email is already registered. Please log in or use another email." });
    }

    const cleanHandle = handle && handle.trim()
      ? handle.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, "")
      : cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");

    if (!cleanHandle) {
      return res.status(400).json({ msg: "Please provide a valid username containing letters, numbers or underscores." });
    }

    const existingHandle = await userModel.findOne({ handle: cleanHandle });
    if (existingHandle) {
      return res.status(409).json({ msg: `Username @${cleanHandle} is already taken. Please choose another username.` });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new userModel({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      bio: bio ? bio.trim() : "College Chirper 🎓",
      handle: cleanHandle,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    });

    const { accessToken, refreshToken } = generateTokens(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      msg: "User Registered successfully",
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        handle: newUser.handle,
        role: newUser.role,
        bio: newUser.bio,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      const isHandle = error.message.includes("handle") || (error.keyPattern && error.keyPattern.handle);
      if (isHandle) {
        return res.status(409).json({ msg: "Username is already taken. Please choose another username." });
      }
      return res.status(409).json({ msg: "Email is already registered. Please log in or use another email." });
    }
    res.status(400).json({ msg: error.message || "Registration failed. Please check your details." });
  }
});

// 2. LOGIN
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ msg: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).send({ msg: "User is not Registered" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send({ msg: "Wrong Password" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).send({
      msg: "Login Successfully",
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ msg: "Login error", error: error.message });
  }
});

// 3. GOOGLE / FIREBASE AUTHENTICATION (Sign in or Sign up with Google/Gmail)
userRouter.post("/google", async (req, res) => {
  try {
    const { email, name, avatar, uid } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Google email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await userModel.findOne({ email: cleanEmail });

    if (!user) {
      // First-time Google user: automatically generate a unique campus handle
      const baseHandle = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "chirper";
      let candidateHandle = baseHandle;
      let counter = 1;

      while (await userModel.findOne({ handle: candidateHandle })) {
        candidateHandle = `${baseHandle}${counter}`;
        counter++;
      }

      // Generate secure random hashed password for account integrity
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new userModel({
        name: name ? name.trim() : cleanEmail.split("@")[0],
        email: cleanEmail,
        password: hashedPassword,
        role: "user",
        bio: "College Chirper 🎓",
        handle: candidateHandle,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`,
      });
    } else {
      // Existing user logging in with Google: update avatar if provided
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      msg: "Google Authentication successful",
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ msg: "Google authentication failed", error: error.message });
  }
});

// 4. REFRESH TOKEN
userRouter.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).send({ msg: "Refresh token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).send({ msg: "Invalid or expired refresh token" });
    }

    const user = await userModel.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).send({ msg: "Invalid refresh token or session terminated" });
    }

    const { accessToken } = generateTokens(user);
    res.status(200).send({
      msg: "Access token refreshed",
      token: accessToken,
      accessToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).send({ msg: "Token refresh error", error: error.message });
  }
});

// 5. CURRENT USER INFO (/me)
userRouter.get("/me", auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    const [followersCount, followingCount, postsCount] = await Promise.all([
      followModel.countDocuments({ following: user._id }),
      followModel.countDocuments({ follower: user._id }),
      postModel.countDocuments({ author: user._id }),
    ]);

    res.status(200).send({
      user: {
        ...user.toObject(),
        followersCount,
        followingCount,
        postsCount,
      },
    });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching user info", error: error.message });
  }
});

// 6. USER PROFILE (/profile/:idOrHandle)
userRouter.get("/profile/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    } else {
      query = { handle: identifier.toLowerCase() };
    }

    const user = await userModel.findOne(query).select("-password -refreshToken");
    if (!user) {
      return res.status(404).send({ msg: "Profile not found" });
    }

    const [followersCount, followingCount, postsCount] = await Promise.all([
      followModel.countDocuments({ following: user._id }),
      followModel.countDocuments({ follower: user._id }),
      postModel.countDocuments({ author: user._id }),
    ]);

    // Check if requester is logged in & following this user
    let isFollowing = false;
    let authHeader = req.headers.authorization;
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) authHeader = authHeader.slice(7).trim();
      try {
        const decoded = jwt.verify(authHeader, JWT_SECRET);
        const followDoc = await followModel.findOne({
          follower: decoded.userId || decoded.id,
          following: user._id,
        });
        isFollowing = !!followDoc;
      } catch (e) {
        // Not logged in or invalid token
      }
    }

    res.status(200).send({
      user: {
        ...user.toObject(),
        followersCount,
        followingCount,
        postsCount,
        isFollowing,
      },
    });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching profile", error: error.message });
  }
});

// 7. UPDATE PROFILE
userRouter.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio, avatar, handle } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar) updates.avatar = avatar.trim();
    if (handle) {
      const cleanHandle = handle.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, "");
      const existing = await userModel.findOne({ handle: cleanHandle, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(409).send({ msg: "Handle is already taken" });
      }
      updates.handle = cleanHandle;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(req.user.id, updates, { new: true })
      .select("-password -refreshToken");

    res.status(200).send({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).send({ msg: "Error updating profile", error: error.message });
  }
});

// 8. SEARCH USERS
userRouter.get("/search", async (req, res) => {
  const { q, email } = req.query;
  const searchStr = q || email;

  if (!searchStr || !searchStr.trim()) {
    return res.status(400).send({ msg: "Please provide a query to search", users: [] });
  }

  try {
    const regex = new RegExp(searchStr.trim(), "i");
    const users = await userModel
      .find(
        {
          $or: [{ name: regex }, { email: regex }, { handle: regex }],
        },
        "name email handle role avatar bio _id"
      )
      .limit(20);

    res.send({ users });
  } catch (error) {
    res.status(500).send({ msg: "Error searching users", error: error.message, users: [] });
  }
});

// 9. SUGGESTED USERS TO FOLLOW
userRouter.get("/suggested", auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    // Find who the current user already follows
    const follows = await followModel.find({ follower: currentUserId }).select("following");
    const followingIds = follows.map((f) => f.following);
    followingIds.push(currentUserId);

    // Suggest users not currently followed
    const suggested = await userModel
      .find({ _id: { $nin: followingIds } }, "name email handle avatar bio role")
      .limit(5);

    res.status(200).send({ suggested });
  } catch (error) {
    res.status(500).send({ msg: "Error fetching suggestions", error: error.message });
  }
});

module.exports = { userRouter };
