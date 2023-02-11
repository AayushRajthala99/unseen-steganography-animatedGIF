const express = require("express");
const router = express.Router();

const { index, process } = require("../controllers/ApplicationController");

router.get("/", index);
router.post("/", process);

module.exports = router;
