const voiceService = require("../voice/voice.service");
const nlpService = require("../nlp/nlp.service");
const auditRepo = require("../repositories/audit.repository");

async function transcribe(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "MISSING_AUDIO_FILE" });

    const actorId = req.user?.id || null;

    const transcript = await voiceService.transcribeBuffer(req.file);

    if (actorId) {
      await auditRepo.logAudit({
        action: "VOICE_TRANSCRIBED",
        entity: "VOICE",
        entityId: null,
        actorId,
      });
    }

    return res.json({ transcript });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

async function proposeTaskFromVoice(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "MISSING_AUDIO_FILE" });

    const actorId = req.headers["x-actor-id"] || null;
    const transcript = await voiceService.transcribeBuffer(req.file);

    if (actorId) {
      await auditRepo.logAudit({
        action: "VOICE_TRANSCRIBED",
        entity: "VOICE",
        entityId: null,
        actorId,
      });
    }

    const proposal = await nlpService.proposeFromText(transcript);

    if (actorId) {
      await auditRepo.logAudit({
        action: "TASK_PROPOSED_FROM_VOICE",
        entity: "TASK_PROPOSAL",
        entityId: null,
        actorId,
      });
    }

    return res.json({ transcript, proposal });
  }  catch (err) {
    console.error("VOICE_TRANSCRIBE_ERROR:", err);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: err.message || "unknown",
  });
}
}

module.exports = {
  transcribe,
  proposeTaskFromVoice,
};
