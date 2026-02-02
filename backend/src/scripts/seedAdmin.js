const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, { tries = 15, delayMs = 800 } = {}) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      console.log(`⏳ seed retry ${i}/${tries}: ${e.code || e.message}`);
      await sleep(delayMs);
    }
  }
  throw last;
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@cook.test";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123!";
  const role = process.env.SEED_ADMIN_ROLE || "expert";
  const name = process.env.SEED_ADMIN_NAME || "Admin";

await withRetry(async () => {
  await db.query("SELECT 1");
  // attendre que la colonne email existe
  await db.query("SELECT email FROM users LIMIT 1");
}, { tries: 60, delayMs: 1000 });

  // 2) Ensure columns exist (safe even if already there)
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT;
  `);

  // 3) Ensure unique index on email
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'users_email_unique'
      ) THEN
        CREATE UNIQUE INDEX users_email_unique ON users (lower(email));
      END IF;
    END $$;
  `);

  // 4) Check if admin exists
  const existing = await db.query(
    "SELECT id FROM users WHERE lower(email)=lower($1) LIMIT 1",
    [email]
  );

  if (existing.rows.length) {
    console.log("✅ Seed admin already exists:", email);
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users (id, name, role, email, password_hash)
     VALUES ($1,$2,$3,$4,$5)`,
    [uuidv4(), name, role, email, hash]
  );

  console.log("✅ Seed admin created:", email);
}

module.exports = { seedAdmin };
