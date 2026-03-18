export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // default: Rachel

  if (!apiKey) {
    return res.status(501).json({
      error: "TTS is not configured (missing ELEVENLABS_API_KEY)",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch { body = {}; }
  }

  const text = (body && body.text != null) ? String(body.text).trim() : "";
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  // Keep responses short and fast for call UX
  const clipped = text.length > 800 ? text.slice(0, 800) : text;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: clipped,
        model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs TTS error:", response.status, errText);
      return res.status(response.status).json({ error: "TTS provider error" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("TTS server error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

