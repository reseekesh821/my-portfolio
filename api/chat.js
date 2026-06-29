// POST /api/chat — Groq chat completion with JSON action routing for the portfolio assistant.
import { buildChatSystemPrompt } from "./prompts/chat-system.js";

const GROQ_TIMEOUT_MS = 10000;
const GROQ_MODEL_HEAVY = "llama-3.3-70b-versatile";
const GROQ_MODEL_FAST = "llama-3.1-8b-instant";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "Server configuration error (Missing API Key)" });
  }

  const { messages, language } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    // --- Shopping intent helpers (guard premature search-tab opens) ---
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

    function containsBlockedAdultIntent(text) {
      const t = String(text || "").toLowerCase();
      return /\b(porn|porno|pornhub|xvideos|xnxx|sex video|adult video|adult site|nude|nudes|nsfw|xxx|explicit sex|erotic)\b/.test(t);
    }

    // --- Build Groq payload (system prompt stays server-side) ---
    // Client sends user/assistant history only; strip any legacy system messages.
    const conversationMessages = messages.filter(
      (msg) => msg && (msg.role === "user" || msg.role === "assistant") && typeof msg.content === "string"
    );

    const normalizedLang = typeof language === "string" ? language.trim().toLowerCase() : "en";
    const languageMap = {
      en: "English",
      ne: "Nepali",
      es: "Spanish",
      zh: "Chinese",
      fr: "French",
      de: "German",
      pt: "Portuguese"
    };
    const responseLanguage = languageMap[normalizedLang] || "English";

    const systemPromptOverride = process.env.CHAT_SYSTEM_PROMPT;
    const systemContent = systemPromptOverride || buildChatSystemPrompt(responseLanguage);

    const payloadMessages = [
      { role: "system", content: systemContent },
      ...conversationMessages
    ];

    const userMessages = getUserMessages(conversationMessages);
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";
    const previousUserMessage = userMessages[userMessages.length - 2]?.content || "";

    const lastUserWords = lastUserMessage.trim().split(/\s+/).filter(Boolean).length;
    const useHeavyModel = lastUserMessage.trim().length > 48 || lastUserWords > 7;
    const primaryModel = useHeavyModel ? GROQ_MODEL_HEAVY : GROQ_MODEL_FAST;

    // --- Call Groq (heavy vs fast model, with timeout and fallback) ---
    async function callGroq(model) {
      const groqController = new AbortController();
      const groqTimeoutId = setTimeout(() => groqController.abort(), GROQ_TIMEOUT_MS);
      try {
        return await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: payloadMessages,
            response_format: { type: "json_object" },
            temperature: 0.45,
            top_p: 0.9,
            max_tokens: 180
          }),
          signal: groqController.signal
        });
      } finally {
        clearTimeout(groqTimeoutId);
      }
    }

    let response;
    try {
      response = await callGroq(primaryModel);
      if (!response.ok && (response.status === 429 || response.status >= 500)) {
        console.warn("Groq model error, trying alternate:", response.status, primaryModel);
        const fallbackModel = primaryModel === GROQ_MODEL_FAST ? GROQ_MODEL_HEAVY : GROQ_MODEL_FAST;
        response = await callGroq(fallbackModel);
      }
    } catch (groqErr) {
      if (groqErr && groqErr.name === "AbortError") {
        console.warn("Groq timed out, trying fast model");
        response = await callGroq(GROQ_MODEL_FAST);
      } else {
        throw groqErr;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", response.status, errorText);
      const isRateLimit = response.status === 429;
      return res.status(200).json({
        reply: isRateLimit
          ? "I'm getting a lot of requests right now — give me a second and try again."
          : "I'm having a little trouble thinking right now. Please try again.",
        action: "reply_only",
        params: {}
      });
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

    // --- Parse JSON reply and sanitize action/params ---
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

    if (containsBlockedAdultIntent(lastUserMessage)) {
      safeAction = "reply_only";
      safeReply = "Sorry, I can't help open adult content or porn sites.";
    }

    // Never trigger site actions on one-word chat replies (yes, ok, nothing, etc.)
    const shortReply = String(lastUserMessage || "").trim().split(/\s+/).length <= 2;
    if (shortReply && safeAction !== "reply_only") {
      safeAction = "reply_only";
    }

    return res.status(200).json({
      reply: safeReply,
      action: safeAction,
      params: safeParams
    });

  } catch (error) {
    console.error("Server Error:", error);
    const timedOut = error && error.name === "AbortError";
    return res.status(200).json({
      reply: timedOut
        ? "That took too long — please try again."
        : "Something went wrong on my end. Please try again.",
      action: "reply_only",
      params: {}
    });
  }
}
