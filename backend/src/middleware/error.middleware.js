module.exports = (err, req, res, next) => {
  if (err?.message === "INVALID_AUDIO_FORMAT") {
    return res.status(400).json({ error: "INVALID_AUDIO_FORMAT" });
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "AUDIO_TOO_LARGE" });
  }
  console.error(err);
  return res.status(500).json({ error: "INTERNAL_ERROR" });
};
