const express = require("express");
const multer = require("multer");
const controller = require("../controllers/voice.controller");
console.log("VOICE controller keys:", Object.keys(controller));

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = (file.originalname || "").toLowerCase();
    const okExt =
      name.endsWith(".wav") ||
      name.endsWith(".mp3") ||
      name.endsWith(".m4a") ||
      name.endsWith(".webm") ||
      name.endsWith(".mp4");

    if (!okExt) return cb(new Error("INVALID_AUDIO_FORMAT"));
    return cb(null, true);
  },
});
router.post("/transcribe", upload.single("audio"), controller.transcribe);
router.post("/propose-task", upload.single("audio"), controller.proposeTaskFromVoice);


module.exports = router;
