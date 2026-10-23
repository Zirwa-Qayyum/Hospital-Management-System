require("dotenv").config();
const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const CHATTERMATE_API_URL = process.env.CHATTERMATE_API_URL || "https://chattermate.ai/api/chat/stream";
const CHATTERMATE_API_KEY = process.env.CHATTERMATE_API_KEY;

if (!CHATTERMATE_API_KEY) {
  console.error("❌ Missing CHATTERMATE_API_KEY in .env");
  process.exit(1);
}

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.post("/api/chat", async (req, res) => {
  const { message, context, instructions } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const fullPrompt = `${instructions || ""}\n\nHospital Data Context:\n${JSON.stringify(context, null, 2)}\n\nUser Question: ${message}`;

  try {
    const upstream = await fetch(CHATTERMATE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": CHATTERMATE_API_KEY
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        models: ["gpt-6-luna"]
      })
    });

    const rawText = await upstream.text();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream error: ${rawText}` });
    }

    // Extract content chunks from the stream text
    let finalAnswer = "";
    const matches = rawText.match(/"content"\s*:\s*"([^"]+)"/g);
    if (matches && matches.length > 0) {
      finalAnswer = matches
        .map(m => {
          const val = m.match(/"content"\s*:\s*"([^"]+)"/);
          return val ? val[1] : "";
        })
        .join("");
    }

    // Fallback if regex didn't catch the chunks
    if (!finalAnswer) {
      try {
        const parsed = JSON.parse(rawText);
        finalAnswer = parsed.answer || parsed.response || parsed.reply || rawText;
      } catch (_) {
        finalAnswer = rawText;
      }
    }

    return res.json({ answer: finalAnswer });

  } catch (error) {
    console.error("Proxy error:", error.message);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ MediCore Proxy running at http://localhost:${PORT}`);
});