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
      "60289f7f43b64f3f781a0d68a49f355a:cd42e10fa8d0394f2772a30290902389b0d47297d2429d22713981995970accd12ddeb4e73d74f5818207fdc2caf01e7274dbd68f95d5912267b4fa1f451a0fbdcf80aa5328200437845f8484e565cd5b24a95671facb6f03b9a62427f8ff90568393251699ec18c4a6989d3f78b9040ba64b0616116c8d5264ff0282d9b6585c6052e482685fc5ec73dbb20afa5f18f02b5f03c1aee4f5e14c48b0759faa2b8bceb8bcbc1697f2243e740eedaeabebe9b32f993a2a747ec9cb0ffbed7de99d58c46c6a5c90ad2c5faa875d9ad971adf";

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
