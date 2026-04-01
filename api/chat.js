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
    function getUserMessages(list) {
      return list.filter((msg) => msg && msg.role === "user" && typeof msg.content === "string");
    }

    function looksLikeExploratoryShoppingQuestion(text) {
      const t = String(text || "").toLowerCase().trim();
      if (!t) return false;
      return (
        /\b(which|what|best|better|recommend|recommendation|suggest|suggestion|help me choose|which one)\b/.test(t) &&
        !/\bunder\s+\$?\d+|\b\d{3,5}\b|\bbuy\b|\bshop\b|\border\b|\bsearch\b|\bfind\b/.test(t)
      );
    }

    function looksLikeConcreteShoppingIntent(text) {
      const t = String(text || "").toLowerCase().trim();
      if (!t) return false;
      return (
        /\b(buy|shop|order|search|find|look up|lookup)\b/.test(t) ||
        /\bunder\s+\$?\d+|\b\d{3,5}\b/.test(t)
      );
    }

    function extractBudget(text) {
      const t = String(text || "").toLowerCase();
      const underMatch = t.match(/\bunder\s+\$?(\d{3,5})\b/);
      if (underMatch) return underMatch[1];
      const directMatch = t.match(/\b(\d{3,5})\b/);
      return directMatch ? directMatch[1] : "";
    }

    function extractShoppingTopic(text) {
      const t = String(text || "").toLowerCase();
      const topics = [
        "laptop",
        "iphone",
        "phone",
        "smartphone",
        "macbook",
        "ipad",
        "tablet",
        "monitor",
        "tv",
        "headphones",
        "earbuds",
        "camera",
        "keyboard",
        "mouse",
        "printer",
        "router",
        "ssd",
        "charger",
        "shoes",
        "sneakers",
        "watch"
      ];
      return topics.find((topic) => t.includes(topic)) || "";
    }

    const baseMessages = [...messages];
    const firstMessage = baseMessages[0];
    const remainingMessages =
      firstMessage && firstMessage.role === "system"
        ? baseMessages.slice(1)
        : baseMessages;

    const agentInstruction = {
      role: "system",
      content:
        "You are an action-oriented AI assistant for a personal portfolio website. " +
        "Always respond with valid JSON only. Do not include markdown fences or any extra text. " +
        "Return this exact shape: " +
        '{"reply":"short natural reply for the user","action":"reply_only | switch_tab | open_search_tab | open_external_link | play_music | pause_music | start_audio_call | end_audio_call | start_video_call | end_video_call | fetch_news","params":{}}. ' +
        "Rules: " +
        "1) Only use action open_search_tab when the user clearly wants to search or shop right now, or after enough details have been provided in the conversation. " +
        "If the user is still asking exploratory questions like which is best, what do you recommend, help me choose, or they have not yet shared important details like budget/use case, stay in reply_only and ask a short follow-up question instead of opening a search. " +
        "If the user later provides a concrete budget, price range, model, or shopping intent, then you may use open_search_tab with params.query. " +
        "For open_search_tab, also include params.provider when helpful. Allowed providers are google, amazon, bestbuy, ebay, youtube. " +
        "Use amazon for general shopping/product intent, bestbuy for electronics/phones/laptops/tvs/accessories, ebay for used/collectible items, youtube for videos/reviews/tutorials, and google when unsure. " +
        "2) If the user wants a portfolio section, use switch_tab with params.target equal to one of intro, projects, education, hometown, favorites, games, news, contact. " +
        "3) If the user wants resume, LinkedIn, or GitHub, use open_external_link with params.url and a short reply. " +
        "4) For normal conversation or questions, use reply_only. " +
        "5) Keep reply concise and helpful. " +
        "6) Never invent unsupported actions. " +
        "7) If uncertain, use reply_only."
    };

    const payloadMessages = firstMessage && firstMessage.role === "system"
      ? [firstMessage, agentInstruction, ...remainingMessages]
      : [agentInstruction, ...remainingMessages];

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
          response_format: { type: "json_object" },
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
    const extractedJsonMatch = typeof rawContent === "string"
      ? rawContent.match(/\{[\s\S]*\}/)
      : null;
    const jsonCandidate = extractedJsonMatch ? extractedJsonMatch[0] : rawContent;

    let parsed;
    try {
      parsed = JSON.parse(jsonCandidate);
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

    const userMessages = getUserMessages(baseMessages);
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";
    const previousUserMessage = userMessages[userMessages.length - 2]?.content || "";

    let safeAction = allowedActions.has(parsed?.action) ? parsed.action : "reply_only";
    let safeReply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "I'm not sure, but I can still help.";
    const safeParams =
      parsed?.params && typeof parsed.params === "object" && !Array.isArray(parsed.params)
        ? parsed.params
        : {};
    const budget = extractBudget(lastUserMessage);
    const previousTopic = extractShoppingTopic(previousUserMessage);
    const topic = extractShoppingTopic(lastUserMessage) || previousTopic;

    if (
      safeAction === "open_search_tab" &&
      looksLikeExploratoryShoppingQuestion(lastUserMessage) &&
      !looksLikeConcreteShoppingIntent(previousUserMessage)
    ) {
      safeAction = "reply_only";
    }

    if (
      safeAction === "reply_only" &&
      budget &&
      topic &&
      (looksLikeExploratoryShoppingQuestion(previousUserMessage) || /\b(buy|shop|looking for|want)\b/.test(previousUserMessage.toLowerCase()))
    ) {
      safeAction = "open_search_tab";
      safeParams.query = `${topic} under ${budget}`;
      safeReply = `Checking ${topic} options around $${budget} for you.`;
    }

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
