const fs = require("fs");
const path = require("path");
const { logger } = require("../utils/logger");
const { hashedKey, encryptMessage, decryptMessage } = require("../utils/utils");

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
      key: hashedKey(key),
      secretmessage: null,
    };

    // Encode Operation Handler...
    if (operation == "0") {
      requestObject.operationName = "ENCODE";
      requestObject.secretmessage = secretmessage;
      let encodeResult = await encode(requestObject);
      if (encodeResult.status) {
        let result = encodeResult.result;
        console.log("ENCODE RESULT===", result);
        res.render("application/result", { result: result });
      } else {
        throw {
          message: "ERROR PERFORMING ENCODE OPERATION",
        };
      }
    }

    // Decode Operation Handler...
    if (operation == "1") {
      requestObject.operation = "DECODE";
      let decodeResult = await decode(requestObject);
      if (decodeResult.status) {
        console.log("DECODE RESULT===", decodeResult.result);
        res.render("application/result", { result: result });
      } else {
        throw {
          error: "ERROR PERFORMING DECODE OPERATION",
        };
      }
    }
  } catch (error) {
    logger.error(`START PROCESS ERROR: ${error.error}`);
    res.render("error", {
      error: error.error,
    });
  }
}

async function encode(objectData) {
  try {
    operationResult = encryptMessage(objectData.secretmessage, objectData.key);
    if (operationResult.status) {
      objectData.secretmessage = operationResult.message;
      console.log("ENCODE OBJECT DATA===", objectData);
      //Encode Operation Here...

      // Return Values...
      return { status: true, result: objectData };
    }
  } catch (error) {
    logger.error(`ENCODE OPERATION ERROR: ${error.error}`);
    return { status: false };
  }
}

async function decode(objectData) {
  try {
    console.log("DECODE OBJECT DATA===", objectData);

    //Decode Operation Here...

    // Return Values...
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
