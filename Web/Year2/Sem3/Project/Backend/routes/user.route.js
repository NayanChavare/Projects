const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../model/user.model");

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    bcrypt.hash(password, 5, async (err, hash) => {
      if (hash) {
        const user = new userModel({ name, email, password: hash });
        await user.save();
        res.send("User Registered successfully");
      }
    });
  } catch (error) {
    res.send("Can't Registered successfully");
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.find({ email });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (result) {
          const token = jwt.sign({ disha: "anshu" }, "coding");
          res.send({ msg: "Login Successfully", token });
        } else {
          res.send("Wrong Password");
        }
      });
    } else {
      res.send("User is not Registered");
    }
  } catch (error) {
    res.send("User is not Registered");
  }
});

/**
 * Handle Firebase Verified Login / Registration (Google / Phone)
 * Authenticates user and issues backend JWT session token
 */
userRouter.post("/firebase-sync", async (req, res) => {
  const { name, email, phone, uid, authProvider } = req.body;

  if (!email && !phone) {
    return res.status(400).send({ success: false, message: "Email or phone is required" });
  }

  try {
    const searchEmail = (email || `${phone.replace(/[^0-9]/g, "")}@pulsechat.phone`).toLowerCase().trim();
    let user = await userModel.findOne({
      $or: [
        { email: searchEmail },
        ...(phone ? [{ phone: phone.trim() }] : []),
        ...(uid ? [{ firebaseUid: uid }] : []),
      ],
    });

    if (user) {
      // Update phone or name if newly verified
      let updated = false;
      if (phone && !user.phone) {
        user.phone = phone.trim();
        updated = true;
      }
      if (uid && !user.firebaseUid) {
        user.firebaseUid = uid;
        updated = true;
      }
      if (authProvider && !user.authProvider) {
        user.authProvider = authProvider;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Register new user authenticated via Firebase
      const displayName = name?.trim() || searchEmail.split("@")[0];
      user = new userModel({
        name: displayName,
        email: searchEmail,
        phone: phone ? phone.trim() : "",
        firebaseUid: uid || "",
        authProvider: authProvider || "firebase",
        password: "", // Handled securely via Firebase OTP / OAuth
      });
      await user.save();
    }

    const token = jwt.sign({ disha: "anshu" }, "coding");
    return res.send({
      success: true,
      msg: "Authenticated successfully with Firebase",
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
    });
  } catch (error) {
    console.error("Firebase sync error:", error);
    return res.status(500).send({ success: false, message: "Server error during authentication" });
  }
});

// Search users by email or phone in MongoDB Atlas
userRouter.get("/search", async (req, res) => {
  const { email } = req.query;
  if (!email || !email.trim()) {
    return res.status(400).send({ msg: "Please provide an email to search", users: [] });
  }

  try {
    // Case-insensitive search matching email or phone
    const users = await userModel.find(
      {
        $or: [
          { email: { $regex: email.trim(), $options: "i" } },
          { phone: { $regex: email.trim(), $options: "i" } },
          { name: { $regex: email.trim(), $options: "i" } },
        ],
      },
      "name email phone _id"
    );
    res.send({ users });
  } catch (error) {
    res.status(500).send({ msg: "Error searching users in MongoDB", error: error.message, users: [] });
  }
});

module.exports = { userRouter };
