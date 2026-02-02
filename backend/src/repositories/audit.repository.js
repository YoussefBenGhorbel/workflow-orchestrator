// src/repositories/audit.repository.js
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

async function logAudit({ action, entity, entityId, actorId }) {
  const q = `
    INSERT INTO audit_logs (id, action, entity, entity_id, actor_id)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await pool.query(q, [uuidv4(), action, entity, entityId, actorId]);
}

async function list(limit = 50) {
  const { rows } = await pool.query(
    `
    SELECT created_at, action, entity, entity_id, actor_id
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [limit]
  );
  return rows;
}

module.exports = { logAudit, list };
