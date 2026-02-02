const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

async function createTask({ title, description, priority, assignedTo, createdBy }) {
  const query = `
    INSERT INTO tasks (id, title, description, priority, assigned_to, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    uuidv4(),
    title,
    description,
    priority,
    assignedTo,
    createdBy,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function getTasks() {
  const { rows } = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
  return rows;
}

async function updateTaskStatus({ id, status }) {
  const query = `
    UPDATE tasks
    SET status = $2
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id, status]);
  return rows[0] || null;
}

module.exports = { createTask, getTasks, updateTaskStatus };
