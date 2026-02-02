function proposeFromText(text) {
  const t = text.toLowerCase();

  let priority = "GREEN";
  if (/(urgent|aujourd'hui|asap|immédiat)/.test(t)) priority = "RED";
  else if (/(cette semaine|rapidement|à faire)/.test(t)) priority = "ORANGE";

  // Titre court: 6–10 mots max
  const title = text.trim().split(/\s+/).slice(0, 10).join(" ");

  return {
    title,
    description: text.trim(),
    priority,
  };
}

module.exports = { proposeFromText };
