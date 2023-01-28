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

function process(req, res) {
  try {
    res.render("application/index");
    // Encode & Decode Operation Handlers...
  } catch (error) {
    logger.error(`START PROCESS ERROR: ${error}`);
    res.render("error", {
      error: "ERROR PROCESSING INPUT DATA",
    });
  }
}

function encode(req, res) {
  try {
    return;
  } catch (error) {
    logger.error(`ENCODE OPERATION ERROR: ${error}`);
    res.render("error", {
      error: "ERROR PERFORMING ENCODE OPERATION",
    });
  }
}

async function decode(req, res) {
  try {
    return;
  } catch (error) {
    logger.error(`DECODE OPERATION ERROR: ${error}`);
    res.render("error", {
      error: "ERROR PERFORMING DECODE OPERATION",
    });
  }
}

module.exports = {
  index,
  process,
};
