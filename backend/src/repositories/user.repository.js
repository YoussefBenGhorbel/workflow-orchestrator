const db = require("../config/db"); // adapte si ton projet exporte le pool ailleurs
const bcrypt = require("bcryptjs");

async function findByEmail(email) {
  const { rows } = await db.query(
    `SELECT id, email, role, password_hash
     FROM users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function verifyPassword(user, password) {
  if (!user?.password_hash) return false;
  return bcrypt.compare(password, user.password_hash);
}

async function createUser({ id, email, role, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users (id, email, role, password_hash)
     VALUES ($1, $2, $3, $4)`,
    [id, email, role, passwordHash]
  );

  return { id, email, role };
}

module.exports = {
  findByEmail,
  verifyPassword,
  createUser,
};
