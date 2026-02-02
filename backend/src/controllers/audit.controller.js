const auditRepo = require("../repositories/audit.repository");

async function listAudit(req, res) {
  try {
    const limit = Number(req.query.limit || 50);
    const rows = await auditRepo.list(limit);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

module.exports = { listAudit };
    