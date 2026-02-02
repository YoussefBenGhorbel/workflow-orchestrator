const express = require("express");
const router = express.Router();
const controller = require("../controllers/task.controller");

router.post("/", controller.createTask);
router.get("/", controller.listTasks);
router.patch("/:id/status", controller.updateTaskStatus);

module.exports = router;
