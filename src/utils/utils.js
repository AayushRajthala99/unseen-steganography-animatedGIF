const { logger } = require("../utils/logger");
const crypto = require("crypto");
const algorithm = "aes-256-cbc";

// Hash the password using SHA-256
function hashedKey(key) {
  const hash = crypto.createHash("md5");
  hash.update(key);
  key = hash.digest("hex");
  return key;
}

function encryptMessage(message, key) {
  try {
    // Message Encryption Code...
    key = hashedKey(key);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedMessage = cipher.update(message, "utf8", "hex");
    encryptedMessage += cipher.final("hex");
    return {
      status: true,
      message: `${iv.toString("hex")}:${encryptedMessage}`,
    };
  } catch (error) {
    logger.error(`MESSAGE ENCRYPTION OPERATION ERROR: ${error}`);
    return {
      status: false,
      message: "ERROR ENCRYPTING THE MESSAGE",
    };
  }
}

function decryptMessage(message, key) {
  try {
    // Message Decryption Code...
    key = hashedKey(key);
    const parts = message.split(":");
    const iv = Buffer.from(parts.shift(), "hex");
    const encrypted = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedMessage = decipher.update(encrypted, "hex", "utf8");
    decryptedMessage += decipher.final("utf8");
    return { status: true, message: decryptedMessage };
  } catch (error) {
    logger.error(`MESSAGE DECRYPTION OPERATION ERROR: ${error}`);
    return {
      status: false,
      message: "ERROR DECRYPTING THE MESSAGE",
    };
  }
}

module.exports = {
  hashedKey,
  encryptMessage,
  decryptMessage,
};
