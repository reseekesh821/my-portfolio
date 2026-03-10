export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.TAVUS_API_KEY;
  const replicaId = process.env.TAVUS_REPLICA_ID;
  const personaId = process.env.TAVUS_PERSONA_ID;

  if (!apiKey || !replicaId || !personaId) {
    console.error("Missing Tavus env vars:", {
      hasApiKey: !!apiKey,
      hasReplicaId: !!replicaId,
      hasPersonaId: !!personaId
    });
    return res.status(500).json({
      error: "Server configuration error (Missing Tavus credentials)",
      detail: `apiKey=${!!apiKey}, replicaId=${!!replicaId}, personaId=${!!personaId}`
    });
  }

  try {
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        replica_id: replicaId,
        persona_id: personaId
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Tavus API error:", response.status, text);
      return res.status(response.status).json({
        error: "Could not start video call"
      });
    }

    const data = await response.json();

    if (!data.conversation_url) {
      console.error("Tavus returned no conversation_url:", data);
      return res.status(500).json({ error: "No conversation URL received" });
    }

    return res.status(200).json({
      conversation_url: data.conversation_url,
      conversation_id: data.conversation_id || null
    });
  } catch (error) {
    console.error("Tavus session error:", error);
    return res.status(500).json({ error: "Failed to create video call session" });
  }
}
