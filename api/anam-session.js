export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANAM_API_KEY;
  const personaId = process.env.ANAM_PERSONA_ID;

  if (!apiKey || !personaId) {
    console.error("Missing Anam env vars:", {
      hasApiKey: !!apiKey,
      hasPersonaId: !!personaId,
    });
    return res.status(500).json({
      error: "Server configuration error (Missing Anam credentials)",
      detail: `apiKey=${!!apiKey}, personaId=${!!personaId}`,
    });
  }

  try {
    const response = await fetch("https://api.anam.ai/v1/auth/session-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientLabel: "portfolio-video-call",
        personaConfig: { personaId },
      }),
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("Anam API error:", response.status, data);
      return res.status(response.status).json({
        error: "Could not start video call",
        status: response.status,
        detail: data,
      });
    }

    const sessionToken =
      data.sessionToken ||
      data.session_token ||
      data.token ||
      data.session_token_jwt ||
      data.session;

    if (!sessionToken || typeof sessionToken !== "string") {
      console.error("Anam returned no session token:", data);
      return res.status(500).json({ error: "No session token received", detail: data });
    }

    return res.status(200).json({ session_token: sessionToken });
  } catch (error) {
    console.error("Anam session error:", error);
    return res.status(500).json({ error: "Failed to create Anam session" });
  }
}

