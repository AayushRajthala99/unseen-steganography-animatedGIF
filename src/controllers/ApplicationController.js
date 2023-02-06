const fs = require("fs");
const path = require("path");
const { logger } = require("../utils/logger");
const { encryptMessage, decryptMessage } = require("../utils/utils");

async function index(req, res) {
  try {
    res.render("application/index");
  } catch (error) {
    logger.error(`APPLICATION VIEW ERROR: ${error}`);
    res.render("error", {
      error: "ERROR LOADING APPLICATION VIEW PAGE",
    });
  }
}

async function process(req, res) {
  try {
    const { operation, gifFile, key, secretmessage } = req.body;

    // Object Initialization for Encode & Decode Operation...
    let requestObject = {
      operationName: null,
      gifFile: gifFile,
      key: key,
      secretmessage: null,
    };

    // Encode Operation Handler...
    if (operation == "0") {
      requestObject.operationName = "Encode";
      requestObject.secretmessage = secretmessage;
      let encodeResult = await encode(requestObject);
      if (encodeResult.status) {
        res.redirect("/");
      } else {
        throw {
          error: "ERROR PERFORMING ENCODE OPERATION",
        };
      }
    }

    // Decode Operation Handler...
    if (operation == "1") {
      requestObject.operation = "Decode";
      let decodeResult = await decode(requestObject);
      if (decodeResult.status) {
        res.redirect("/");
      } else {
        throw {
          message: "ERROR PERFORMING DECODE OPERATION",
        };
      }
    }
  } catch (error) {
    logger.error(`START PROCESS ERROR: ${error.message}`);
    res.render("error", {
      error: error.message,
    });
  }
}

async function encode(objectData) {
  try {
    console.log(objectData);
    return { status: true, result: objectData };
  } catch (error) {
    logger.error(`ENCODE OPERATION ERROR: ${error}`);
    return { status: false };
  }
}

async function decode(objectData) {
  try {
    console.log(objectData);
    return { status: true, result: objectData };
  } catch (error) {
    logger.error(`DECODE OPERATION ERROR: ${error}`);
    return { status: false };
  }
}

module.exports = {
  index,
  process,
};
