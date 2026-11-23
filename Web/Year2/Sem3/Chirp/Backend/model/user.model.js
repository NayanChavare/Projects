const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    handle: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    bio: { type: String, default: "College Chirper 🎓", maxlength: 160 },
    avatar: { type: String, default: "" },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

// Auto-generate handle and avatar before saving if not provided
userSchema.pre("save", function () {
  if (!this.handle && this.email) {
    this.handle = this.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  }
  if (!this.avatar && this.name) {
    this.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}`;
  }
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
