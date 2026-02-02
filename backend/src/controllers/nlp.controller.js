const nlpService = require("../nlp/nlp.service");
const auditRepo = require("../repositories/audit.repository");

async function proposeTask(req, res) {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "MISSING_TEXT" });
    }

    const actorId = req.headers["x-actor-id"] || null;

    const proposal = await nlpService.proposeFromText(text);

    if (actorId) {
      await auditRepo.logAudit({
        action: "TASK_PROPOSED_FROM_VOICE",
        entity: "TASK_PROPOSAL",
        entityId: null,
        actorId,
      });
    }

    return res.json(proposal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

module.exports = { proposeTask };
