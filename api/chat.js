export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "Server configuration error (Missing API Key)" });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const agentInstruction = {
      role: "system",
      content:
        "You are an action-oriented AI assistant for a personal portfolio website. " +
        "Always respond with valid JSON only. Do not include markdown fences or any extra text. " +
        "Return this exact shape: " +
        '{"reply":"short natural reply for the user","action":"reply_only | switch_tab | open_search_tab | open_external_link | play_music | pause_music | start_audio_call | end_audio_call | start_video_call | end_video_call | fetch_news","params":{}}. ' +
        "Rules: " +
        "1) If the user is asking to search for any product, brand, item, or shopping query, use action open_search_tab with params.query. " +
        "For open_search_tab, also include params.provider when helpful. Allowed providers are google, amazon, bestbuy, ebay, youtube. " +
        "Use amazon for general shopping/product intent, bestbuy for electronics/phones/laptops/tvs/accessories, ebay for used/collectible items, youtube for videos/reviews/tutorials, and google when unsure. " +
        "2) If the user wants a portfolio section, use switch_tab with params.target equal to one of intro, projects, education, hometown, favorites, games, news, contact. " +
        "3) If the user wants resume, LinkedIn, or GitHub, use open_external_link with params.url and a short reply. " +
        "4) For normal conversation or questions, use reply_only. " +
        "5) Keep reply concise and helpful. " +
        "6) Never invent unsupported actions. " +
        "7) If uncertain, use reply_only."
    };

    const payloadMessages = [...messages, agentInstruction];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: payloadMessages,
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 200
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      return res.status(response.status).json({ error: "Error from AI provider" });
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (error) {
      parsed = {
        reply: rawContent || "I'm having trouble connecting. Please try again.",
        action: "reply_only",
        params: {}
      };
    }

    const allowedActions = new Set([
      "reply_only",
      "switch_tab",
      "open_search_tab",
      "open_external_link",
      "play_music",
      "pause_music",
      "start_audio_call",
      "end_audio_call",
      "start_video_call",
      "end_video_call",
      "fetch_news"
    ]);

    const safeAction = allowedActions.has(parsed?.action) ? parsed.action : "reply_only";
    const safeReply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "I'm not sure, but I can still help.";
    const safeParams =
      parsed?.params && typeof parsed.params === "object" && !Array.isArray(parsed.params)
        ? parsed.params
        : {};

    return res.status(200).json({
      reply: safeReply,
      action: safeAction,
      params: safeParams
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
