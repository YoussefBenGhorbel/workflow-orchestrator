async function transcribeBuffer(file) {
  // ✅ fallback MVP: si pas de clé, on ne casse pas le flux
  if (!process.env.OPENAI_API_KEY) {
    return "Stub transcription (OPENAI_API_KEY absent).";
  }
  return await transcribeWithOpenAI(file);
}

async function transcribeWithOpenAI(file) {
  const OpenAI = require("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const fs = require("fs");
  const os = require("os");
  const path = require("path");

  // extension
  const ext = (file.originalname || "wav").split(".").pop().toLowerCase();
  const tmpPath = path.join(os.tmpdir(), `audio_${Date.now()}.${ext}`);

  fs.writeFileSync(tmpPath, file.buffer);
  const stream = fs.createReadStream(tmpPath);

  try {
    const result = await openai.audio.transcriptions.create({
      file: stream,
      model: "whisper-1", // ✅ le plus compatible
    });

    // SDK renvoie souvent { text: "..." }
    const text =
      typeof result === "string"
        ? result
        : (result && (result.text || result.transcript)) || "";

    if (!text) throw new Error("EMPTY_TRANSCRIPTION");

    return text;
  } catch (err) {
  const status = err?.status || err?.response?.status || err?.code;
  const msg = err?.message || "";

  // ✅ fallback sprint 1.5 : démo & produit utilisable
  if (String(msg).includes("429") || status === 429) {
    return "Transcription indisponible (quota IA). Merci de réessayer plus tard ou passer en saisie texte.";
  }

  throw new Error(`TRANSCRIBE_FAILED: ${msg}`);
}
}

module.exports = { transcribeBuffer };
