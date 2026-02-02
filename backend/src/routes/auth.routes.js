const express = require("express");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepo.findByEmail(email);
  if (!user) return res.status(401).json({ error: "BAD_CREDENTIALS" });

  // MVP: si tu as déjà le hash → compare hash (bcrypt)
  // sinon TEMPORAIRE: compare en clair (à éviter en prod)
  const ok = await userRepo.verifyPassword(user, password);
  if (!ok) return res.status(401).json({ error: "BAD_CREDENTIALS" });

  const token = jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: "8h" }
  );

  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

module.exports = router;
