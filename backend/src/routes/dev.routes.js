const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();

router.post("/seed-admin", async (req, res) => {
  try {
    const email = "admin@cook.test";
    const password = "admin123!";
    const role = "expert";
    const name = "Admin";

    const existing = await db.query(
      "SELECT id FROM users WHERE lower(email)=lower($1) LIMIT 1",
      [email]
    );

    if (existing.rows.length) {
      return res.json({ status: "ALREADY_EXISTS" });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (id, name, role, email, password_hash) VALUES ($1,$2,$3,$4,$5)",
      [uuidv4(), name, role, email, hash]
    );

    return res.json({ status: "CREATED", email });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: e.message });
  }
});

module.exports = router;
