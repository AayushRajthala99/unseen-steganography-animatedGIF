const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { logger } = require("../utils/logger");
const { hashedKey, encryptMessage, decryptMessage } = require("../utils/utils");
const { hash } = require("bcrypt");

// Python Script Paths...
let encodeScriptPath = path.resolve("./src/scripts/encode.py");
let decodeScriptPath = path.resolve("./src/scripts/decode.py");

async function runPythonScript(script, filename, key, secretMessage) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      script,
      filename,
      key,
      secretMessage,
    ]);
    let outputMessage;
    let errorMessage;
    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python script output: ${data}`);
      outputMessage = data;
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python script error: ${data}`);
      errorMessage = data;
    });

    pythonProcess.on("close", (code) => {
      if (code == 0) {
        resolve({ message: outputMessage, code: 0 });
      } else {
        reject({ message: errorMessage, error: code });
      }
    });
  });
}

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
    try {
      if (operation == "0") {
        requestObject.operationName = "ENCODE";
        requestObject.secretmessage = secretmessage;

        let encodeResult = await encode(requestObject);
        if (encodeResult.status) {
          let result = encodeResult.result;
          result.key = hashedKey(result.key);

          result.stegFile =
            result.gifFile.replaceAll(".gif", "") +
            "-" +
            result.key +
            "-" +
            (result.secretmessage.length * 4 + 4) +
            "-stego.gif";

          console.log("ENCODE RESULT===", result);
          res.render("application/result", { result: result });
        } else {
          throw "";
        }
      }
    } catch (error) {
      throw { message: "ERROR PERFORMING ENCODE OPERATION" };
    }

    // Decode Operation Handler...
    try {
      if (operation == "1") {
        requestObject.operationName = "DECODE";
        let decodeResult = await decode(requestObject);
        if (decodeResult.status) {
          result = decodeResult.result;
          console.log("\nDECODE RESULT===", result);
          res.render("application/result", { result: result });
        } else {
          throw "";
        }
      }
    } catch (error) {
      throw { message: "ERROR PERFORMING DECODE OPERATION" };
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
    let operationResult = encryptMessage(
      objectData.secretmessage,
      objectData.key
    );

    if (operationResult.status) {
      objectData.secretmessage = operationResult.message;

      //Encode Operation Here...
      encodeArguments = [
        `${encodeScriptPath}`,
        `${objectData.gifFile}`,
        `${hashedKey(objectData.key)}`,
        `${objectData.secretmessage}`,
      ];

      let code, message;

      await runPythonScript(
        encodeArguments[0],
        encodeArguments[1],
        encodeArguments[2],
        encodeArguments[3]
      )
        .then((result) => {
          code = result.code;
          message = result.message;
        })
        .catch((error) => {
          code = error.error;
          message = error.message;
        });

      if (code == 0) {
        // Getting File Size from the Parsed Python Output...
        let byteString = Buffer.from(message, "hex");
        outputValue = byteString.toString("utf8");

        // Regex Declaration for File Sizes...
        const orgRegex = /--ORIGINAL FILE SIZE--\[ ([\d.]+ [KMGT]?B) \]/;
        const stegRegex = /--STEGO FILE SIZE--\[ ([\d.]+ [KMGT]?B) \]/;

        // Regex Match Operation...
        const orgMatch = outputValue.match(orgRegex);
        const stegMatch = outputValue.match(stegRegex);

        if (orgMatch && stegMatch) {
          objectData.originalSize = orgMatch[1];
          objectData.stegoSize = stegMatch[1];
        } else {
          objectData.originalSize = "";
          objectData.stegoSize = "";
        }
        return { status: true, result: objectData };
      } else {
        throw { message: message };
      }
    }
  } catch (error) {
    logger.error(`ENCODE OPERATION ERROR: ${error.message}`);
    return { status: false };
  }
}

async function decode(objectData) {
  try {
    //Decode Operation Here...
    decodeArguments = [`${decodeScriptPath}`, `${objectData.gifFile}`];

    let code, message;

    await runPythonScript(decodeArguments[0], decodeArguments[1])
      .then((result) => {
        code = result.code;
        message = result.message;
      })
      .catch((error) => {
        code = error.error;
        message = error.message;
      });

    if (code == 0) {
      // Getting File Size from the Parsed Python Output...
      let byteString = Buffer.from(message, "hex");
      secretValue = byteString.toString("utf8");

      // Regex Declaration for File Sizes...
      const secretMessageRegex =
        /SECRET MESSAGE \(HEX\) ==\s*([a-f\d]+:[a-f\d]+)\s*/i;

      // Regex Match Operation...
      const secretMatch = secretValue.match(secretMessageRegex);

      if (secretMatch) {
        objectData.secretmessage = secretMatch[1];
      } else {
        objectData.secretmessage = null;
        throw "No Secret Message Detected!";
      }

      let operationResult = decryptMessage(
        objectData.secretmessage,
        objectData.key
      );

      if (operationResult.status) {
        objectData.secretmessage = operationResult.message;
        objectData.key = hashedKey(objectData.key);
        console.log("DECODE OBJECT DATA===", objectData);

        // Return Values...
        return { status: true, result: objectData };
      } else {
        throw "";
      }
    } else {
      throw { message: message };
    }
  } catch (error) {
    logger.error(`DECODE OPERATION ERROR: ${error}`);
    return { status: false };
  }
}

module.exports = {
  index,
  process,
};
