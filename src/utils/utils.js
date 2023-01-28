const { logger } = require("../utils/logger");

function encryptMessage(message, key) {
  try {
    // Message Encryption Code...
    return;
  } catch (error) {
    logger.error(`MESSAGE ENCRYPTION OPERATION ERROR: ${error}`);
    res.render("error", {
      error: "ERROR ENCRYPTING THE MESSAGE",
    });
  }
}

function decryptMessage(message, key) {
  try {
    // Message Decryption Code...
    return;
  } catch (error) {
    logger.error(`MESSAGE DECRYPTION OPERATION ERROR: ${error}`);
    res.render("error", {
      error: "ERROR DECRYPTING THE MESSAGE",
    });
  }
}

module.exports = {
  encryptMessage,
  decryptMessage,
};
