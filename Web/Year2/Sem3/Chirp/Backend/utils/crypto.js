const crypto = require("crypto");

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "chirp_database_post_encryption_key_2026";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest(); // 32 bytes

/**
 * Encrypt plaintext using AES-256-CBC
 * Format stored in MongoDB: <iv_hex>:<encrypted_hex>
 */
function encryptText(text) {
  if (!text || typeof text !== "string") return text;
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
    // If not matching iv:encrypted format, return as-is (e.g. unencrypted legacy text)
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

/**
 * Helper to decrypt post content & replies in any post document or object
 */
function formatPost(postDoc) {
  if (!postDoc) return postDoc;
  const p = postDoc.toObject ? postDoc.toObject() : { ...postDoc };
  if (p.content) {
    p.content = decryptText(p.content);
  }
  if (Array.isArray(p.replies)) {
    p.replies = p.replies.map((r) => {
      const rObj = r.toObject ? r.toObject() : { ...r };
      if (rObj.content) {
        rObj.content = decryptText(rObj.content);
      }
      return rObj;
    });
  }
  return p;
}

module.exports = { encryptText, decryptText, formatPost };
