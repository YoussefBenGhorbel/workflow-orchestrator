const app = require("./app");
const { seedAdmin } = require("./scripts/seedAdmin");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await seedAdmin();
  } catch (e) {
    console.error("❌ Seed failed:", e.message);
    // MVP: on ne crash pas le serveur, mais on log
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on port ${PORT}`);
  });
})();
