// POST /api/chat — Gemini (primary) or Groq (fallback) with JSON action routing.
import { buildChatSystemPrompt } from "./prompts/chat-system.js";

const GEMINI_TIMEOUT_MS = 12000;
const GROQ_TIMEOUT_MS = 10000;
// Free-tier friendly defaults (2.0-flash often hits quota; 2.5-flash works on current keys).
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_MODEL_FALLBACK = process.env.GEMINI_MODEL_FALLBACK || "gemini-2.5-flash-lite";
const GEMINI_MODEL_LITE = process.env.GEMINI_MODEL_LITE || "gemini-flash-lite-latest";
const GROQ_MODEL_HEAVY = process.env.GROQ_MODEL_HEAVY || "llama-3.3-70b-versatile";
const GROQ_MODEL_FAST = process.env.GROQ_MODEL_FAST || "llama-3.1-8b-instant";
const MAX_HISTORY_MESSAGES = 12;

function isIdentityClarificationQuestion(text) {
  const t = String(text || "").toLowerCase().trim();
  if (!t || /^user (said|asked):/i.test(t)) return false;
  if (/^(ok|okay|yes|yeah|yep|sure|yup|no|nah|thanks|thank you|thx|cool|great|nice|good|bye|goodbye)$/i.test(t)) {
    return false;
  }
  if (/\b(who are you|are you rishikesh|you rishikesh)\b/.test(t)) return true;
  if (/\b(your|yours)\b/.test(t) && /\b(project|projects|work)\b/.test(t)) return true;
  if (
    /\b(you|your|yours)\b/.test(t) &&
    /\b(rishikesh|his|him)\b/.test(t) &&
    /\b(or|vs|versus|who|project|projects|work|are you)\b/.test(t)
  ) {
    return true;
  }
  return false;
}

function isBriefAcknowledgment(text) {
  const t = String(text || "").trim().toLowerCase();
  return /^(ok|okay|yes|yeah|yep|sure|yup|cool|great|nice|good|thanks|thank you|thx|bye|goodbye)$/.test(t);
}

function looksLikeFarewell(text) {
  const t = String(text || "").toLowerCase();
  return (
    /\b(you're welcome|you are welcome|anytime|feel free|change your mind|no problem|glad to help|good talking|take care)\b/.test(t) ||
    /\bif you change your mind\b/.test(t)
  );
}

function closingAckReply(rawMessage) {
  const t = String(rawMessage || "").trim().toLowerCase();
  if (/^(thanks|thank you|thx)$/.test(t)) return "You're welcome!";
  if (/^(bye|goodbye)$/.test(t)) return "Bye! Come back anytime.";
  return "Sounds good! Reach out anytime.";
}

function resolveRawLastUserMessage(body, enrichedLast) {
  if (typeof body?.rawLastUserMessage === "string" && body.rawLastUserMessage.trim()) {
    return body.rawLastUserMessage.trim();
  }
  const wrapped = String(enrichedLast || "").match(/^User (?:said|asked): "([^"]+)"/i);
  if (wrapped) return wrapped[1].trim();
  return String(enrichedLast || "").trim();
}

function looksLikeUnwantedBioDump(reply, userMessage) {
  const r = String(reply || "");
  const u = String(userMessage || "").toLowerCase();
  if (r.length < 220) return false;
  if (/\b(everything|all projects|full bio|tell me (all )?about)\b/.test(u)) return false;
  const factSignals =
    (/\bcompliance firewall\b/i.test(r) ? 1 : 0) +
    (/\bquickloan\b/i.test(r) ? 1 : 0) +
    (/\bbudgettracker\b/i.test(r) ? 1 : 0) +
    (/\binterstellar\b/i.test(r) ? 1 : 0) +
    (/\bcaldwell university\b/i.test(r) ? 1 : 0) +
    (/\bgpa\b/i.test(r) ? 1 : 0);
  return factSignals >= 3 || r.split(/\s+/).length > 55;
}

function normalizeGeminiContents(messages) {
  const contents = [];
  for (const msg of messages) {
    if (!msg || typeof msg.content !== "string") continue;
    const role = msg.role === "assistant" ? "model" : "user";
    const text = msg.content.trim();
    if (!text) continue;
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n${text}`;
      continue;
    }
    contents.push({ role, parts: [{ text }] });
  }
  if (contents.length && contents[0].role === "model") {
    contents.unshift({ role: "user", parts: [{ text: "Hello." }] });
  }
  return contents;
}

function extractJsonText(rawContent) {
  if (typeof rawContent !== "string") return "";
  const match = rawContent.match(/\{[\s\S]*\}/);
  return match ? match[0] : rawContent;
}

async function callGemini({ apiKey, model, systemContent, conversationMessages, signal }) {
  const contents = normalizeGeminiContents(conversationMessages.slice(-MAX_HISTORY_MESSAGES));
  if (!contents.length) {
    throw new Error("No valid messages for Gemini");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemContent }] },
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 256,
          thinkingConfig: { thinkingBudget: 0 }
        }
      }),
      signal
    }
  );

  return { response, provider: "gemini", model };
}

async function callGroq({ apiKey, model, payloadMessages, signal }) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      response_format: { type: "json_object" },
      temperature: 0.4,
      top_p: 0.9,
      max_tokens: 220
    }),
    signal
  });

  return { response, provider: "groq", model };
}

function parseProviderContent(data, provider) {
  if (provider === "gemini") {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts
        .filter((part) => part?.text && !part?.thought)
        .map((part) => part.text)
        .join("")
        .trim();
    }
    const blockReason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
    if (blockReason) {
      console.warn("Gemini blocked or empty:", blockReason);
    }
    return "";
  }
  return data?.choices?.[0]?.message?.content || "";
}

async function fetchWithTimeout(fn, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runChatCompletion({
  preferredProvider,
  geminiApiKey,
  groqApiKey,
  systemContent,
  conversationMessages,
  payloadMessages,
  useHeavyGroqModel
}) {
  const attempts = [];

  if (preferredProvider === "gemini" && geminiApiKey) {
    attempts.push(
      { provider: "gemini", model: GEMINI_MODEL, timeout: GEMINI_TIMEOUT_MS },
      { provider: "gemini", model: GEMINI_MODEL_FALLBACK, timeout: GEMINI_TIMEOUT_MS },
      { provider: "gemini", model: GEMINI_MODEL_LITE, timeout: GEMINI_TIMEOUT_MS }
    );
  } else if (preferredProvider === "groq" && groqApiKey) {
    const primary = useHeavyGroqModel ? GROQ_MODEL_HEAVY : GROQ_MODEL_FAST;
    const fallback = primary === GROQ_MODEL_FAST ? GROQ_MODEL_HEAVY : GROQ_MODEL_FAST;
    attempts.push(
      { provider: "groq", model: primary, timeout: GROQ_TIMEOUT_MS },
      { provider: "groq", model: fallback, timeout: GROQ_TIMEOUT_MS }
    );
  }

  if (preferredProvider === "gemini" && groqApiKey) {
    const primary = useHeavyGroqModel ? GROQ_MODEL_HEAVY : GROQ_MODEL_FAST;
    attempts.push({ provider: "groq", model: primary, timeout: GROQ_TIMEOUT_MS });
  } else if (preferredProvider === "groq" && geminiApiKey) {
    attempts.push({ provider: "gemini", model: GEMINI_MODEL_FALLBACK, timeout: GEMINI_TIMEOUT_MS });
  }

  let lastError = null;

  for (const attempt of attempts) {
    try {
      const result = await fetchWithTimeout(async (signal) => {
        if (attempt.provider === "gemini") {
          return callGemini({
            apiKey: geminiApiKey,
            model: attempt.model,
            systemContent,
            conversationMessages,
            signal
          });
        }
        return callGroq({
          apiKey: groqApiKey,
          model: attempt.model,
          payloadMessages,
          signal
        });
      }, attempt.timeout);

      const { response, provider, model } = result;

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`${provider} error (${model}):`, response.status, errorText.slice(0, 240));
        if (response.status === 429 || response.status >= 500) {
          lastError = { status: response.status, provider, model };
          continue;
        }
        return {
          ok: false,
          status: response.status,
          provider,
          model,
          isRateLimit: response.status === 429
        };
      }

      const data = await response.json();
      const rawContent = parseProviderContent(data, provider);
      if (!rawContent) {
        lastError = { status: 502, provider, model, empty: true };
        continue;
      }

      console.log(`Chat provider: ${provider} (${model})`);
      return { ok: true, rawContent, provider, model };
    } catch (error) {
      const timedOut = error && error.name === "AbortError";
      console.warn(`${attempt.provider} attempt failed (${attempt.model}):`, timedOut ? "timeout" : error.message);
      lastError = { status: timedOut ? 408 : 500, provider: attempt.provider, model: attempt.model };
    }
  }

  return {
    ok: false,
    status: lastError?.status || 503,
    isRateLimit: lastError?.status === 429,
    provider: lastError?.provider || preferredProvider
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const preferredProvider = String(process.env.CHAT_PROVIDER || "gemini").toLowerCase();

  if (!geminiApiKey && !groqApiKey) {
    return res.status(500).json({ error: "Server configuration error (Missing API Key)" });
  }

  const { messages, language, rawLastUserMessage: rawFromClient } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    function getAssistantMessages(list) {
      return list.filter((msg) => msg && msg.role === "assistant" && typeof msg.content === "string");
    }

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
        "laptop", "iphone", "phone", "smartphone", "macbook", "ipad", "tablet",
        "monitor", "tv", "headphones", "earbuds", "camera", "keyboard", "mouse",
        "printer", "router", "ssd", "charger", "shoes", "sneakers", "watch"
      ];
      return topics.find((topic) => t.includes(topic)) || "";
    }

    function containsBlockedAdultIntent(text) {
      const t = String(text || "").toLowerCase();
      return /\b(porn|porno|pornhub|xvideos|xnxx|sex video|adult video|adult site|nude|nudes|nsfw|xxx|explicit sex|erotic)\b/.test(t);
    }

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
      ...conversationMessages.slice(-MAX_HISTORY_MESSAGES)
    ];

    const userMessages = getUserMessages(conversationMessages);
    const enrichedLastUserMessage = userMessages[userMessages.length - 1]?.content || "";
    const rawLastUserMessage = resolveRawLastUserMessage(
      { rawLastUserMessage: rawFromClient },
      enrichedLastUserMessage
    );
    const previousUserMessage = userMessages[userMessages.length - 2]?.content || "";
    const lastAssistantMessage =
      getAssistantMessages(conversationMessages)[getAssistantMessages(conversationMessages).length - 1]?.content || "";

    if (isBriefAcknowledgment(rawLastUserMessage) && looksLikeFarewell(lastAssistantMessage)) {
      return res.status(200).json({
        reply: closingAckReply(rawLastUserMessage),
        action: "reply_only",
        params: {}
      });
    }

    const lastUserWords = rawLastUserMessage.trim().split(/\s+/).filter(Boolean).length;
    const useHeavyGroqModel = rawLastUserMessage.trim().length > 48 || lastUserWords > 7;

    const completion = await runChatCompletion({
      preferredProvider: geminiApiKey ? preferredProvider : "groq",
      geminiApiKey,
      groqApiKey,
      systemContent,
      conversationMessages,
      payloadMessages,
      useHeavyGroqModel
    });

    if (!completion.ok) {
      const isRateLimit = completion.isRateLimit;
      return res.status(200).json({
        reply: isRateLimit
          ? "I'm getting a lot of requests right now — give me a second and try again."
          : "I'm having a little trouble thinking right now. Please try again.",
        action: "reply_only",
        params: {}
      });
    }

    const jsonCandidate = extractJsonText(completion.rawContent);

    let parsed;
    try {
      parsed = JSON.parse(jsonCandidate);
    } catch (error) {
      parsed = {
        reply: completion.rawContent || "I'm having trouble connecting. Please try again.",
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

    let safeAction = allowedActions.has(parsed?.action) ? parsed.action : "reply_only";
    let safeReply =
      typeof parsed?.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "I'm not sure, but I can still help.";
    const safeParams =
      parsed?.params && typeof parsed.params === "object" && !Array.isArray(parsed.params)
        ? parsed.params
        : {};
    const budget = extractBudget(rawLastUserMessage);
    const previousTopic = extractShoppingTopic(previousUserMessage);
    const topic = extractShoppingTopic(rawLastUserMessage) || previousTopic;

    if (
      safeAction === "open_search_tab" &&
      looksLikeExploratoryShoppingQuestion(rawLastUserMessage) &&
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

    if (containsBlockedAdultIntent(rawLastUserMessage)) {
      safeAction = "reply_only";
      safeReply = "Sorry, I can't help open adult content or porn sites.";
    }

    const shortReply = rawLastUserMessage.trim().split(/\s+/).length <= 2;
    if (shortReply && safeAction !== "reply_only") {
      safeAction = "reply_only";
    }

    if (isIdentityClarificationQuestion(rawLastUserMessage)) {
      safeAction = "reply_only";
      safeReply =
        "I'm Rishikesh's digital assistant — not Rishikesh himself. I don't have my own projects; when I mention projects, I mean his work. Want me to open the Projects tab or tell you about one of them?";
    } else if (
      looksLikeUnwantedBioDump(safeReply, rawLastUserMessage) &&
      rawLastUserMessage.trim().split(/\s+/).length <= 8
    ) {
      safeAction = "reply_only";
      safeReply =
        "Rishikesh has built a few projects — want the Projects tab, or should I start with AI Compliance Firewall?";
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
