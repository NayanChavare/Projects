const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../model/user.model");

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);

  try {
    bcrypt.hash(password, 5, async (err, hash) => {
      // Store hash in your password DB.
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
    console.log(user);
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        // result == true
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

// Search users by email in MongoDB Atlas
userRouter.get("/search", async (req, res) => {
  const { email } = req.query;
  if (!email || !email.trim()) {
    return res.status(400).send({ msg: "Please provide an email to search", users: [] });
  }

  try {
    // Case-insensitive search matching email, excludes password
    const users = await userModel.find(
      { email: { $regex: email.trim(), $options: "i" } },
      "name email _id"
    );
    res.send({ users });
  } catch (error) {
    res.status(500).send({ msg: "Error searching users in MongoDB", error: error.message, users: [] });
  }
});

module.exports = { userRouter };
