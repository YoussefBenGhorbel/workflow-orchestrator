const express = require("express");
const controller = require("../controllers/nlp.controller");
const router = express.Router();

router.post("/propose-task", controller.proposeTask);

module.exports = router;
