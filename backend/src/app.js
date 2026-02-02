const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
const auth = require("./middleware/auth.middleware");



app.use(cors({
  origin: ["http://localhost:5173"],
}));
app.use("/dev", require("./routes/dev.routes"));
app.use("/audit", auth, require("./routes/audit.routes"));
  
app.use("/auth", require("./routes/auth.routes"));
app.use("/tasks", auth, require("./routes/task.routes"));
app.use("/voice", auth, require("./routes/voice.routes"));
app.use("/nlp", auth, require("./routes/nlp.routes"));


app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// idéalement ton middleware d'erreur en dernier
app.use(require("./middleware/error.middleware"));

module.exports = app;
