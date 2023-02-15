const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { logger } = require("../utils/logger");
const { hashedKey, encryptMessage, decryptMessage } = require("../utils/utils");

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

    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python script output: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python script error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code == 0) {
        resolve({ code: 0 });
      } else {
        reject({ error: code });
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
      requestObject.operationName = "DECODE";
      let decodeResult = await decode(requestObject);
      if (decodeResult.status) {
        result = decodeResult.result;
        console.log("\nDECODE RESULT===", result);
        res.render("application/result", { result: result });
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
        `${objectData.key}`,
        `${objectData.secretmessage}`,
      ];

      let message;

      await runPythonScript(
        encodeArguments[0],
        encodeArguments[1],
        encodeArguments[2],
        encodeArguments[3]
      )
        .then((result) => {
          message = result.code;
        })
        .catch((error) => {
          message = error.error;
        });

      if (message == 0) {
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
    console.log("DECODE OBJECT DATA===", objectData);

    // Test Secret Message for Now, Use 123123 as the key...
    objectData.secretmessage =
      "fce603bf054edbc649dd1284e7578232:c445c21905089900ff74c59a6e8470f5";
    objectData.key = "123123";

    let operationResult = decryptMessage(
      objectData.secretmessage,
      objectData.key
    );

    if (operationResult.status) {
      objectData.secretmessage = operationResult.message;
      // console.log("DECODE OBJECT DATA===", objectData);
      //Decode Operation Here...

      // Return Values...
      return { status: true, result: objectData };
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
