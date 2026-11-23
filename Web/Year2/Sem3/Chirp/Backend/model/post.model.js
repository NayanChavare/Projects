const mongoose = require("mongoose");
const { decryptText } = require("../utils/crypto");

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    content: { type: String, required: true, trim: true },
    hashtags: [{ type: String, lowercase: true, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    replies: [replySchema],
  },
  { timestamps: true }
);

// Decrypt on JSON serialization
postSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.content) {
    obj.content = decryptText(obj.content);
  }
  if (Array.isArray(obj.replies)) {
    obj.replies = obj.replies.map((r) => {
      const rObj = r.toObject ? r.toObject() : { ...r };
      if (rObj.content) {
        rObj.content = decryptText(rObj.content);
      }
      return rObj;
    });
  }
  return obj;
};

// Index for efficient hashtag lookups and 24h aggregation
postSchema.index({ hashtags: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

const postModel = mongoose.model("post", postSchema);

module.exports = { postModel };
