const express = require("express");
const router = express.Router();
const controller = require("./task.controller");

router.post("/", controller.createTask);

module.exports = router;
