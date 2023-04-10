const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { logger } = require("../utils/logger");
const { hashedKey, encryptMessage, decryptMessage } = require("../utils/utils");
const { log } = require("console");

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
    try {
      if (operation == "0") {
        requestObject.operationName = "ENCODE";
        requestObject.secretmessage = secretmessage;

        let encodeResult = await encode(requestObject);
        if (encodeResult.status) {
          let result = encodeResult.result;
          result.stegFile =
            result.gifFile.replaceAll(".gif", "") + "-stego.gif";
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
    objectData.secretmessage =
      "6c89b95344dc45c36a751dbc36648cc0:c330af6747c9f461f0c95f84e2af2329a81062dad801fe3f52536cd82b094f27bb50f61195487fe8134e3586295c4fc7";

    // Test Secret Message for Now, Use 123123 as the key...
    objectData.key = hashedKey("123123");
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
    } else {
      throw "";
    }
  } catch (error) {
    // logger.error(`DECODE OPERATION ERROR: ${error}`);
    return { status: false };
  }
}

module.exports = {
  index,
  process,
};
