const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");
require("../repositories/user.repository")

router.post("/login", controller.login);

module.exports = router;
