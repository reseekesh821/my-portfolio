// api/chat.js
export default async function handler(req, res) {
  // This runs on Vercel's server, NOT the browser
  const GROQ_API_KEY = process.env.GROQ_API_KEY; 
  const { message, systemPrompt } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Or the one from your playground
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.status(200).json(data); // Send the AI's answer back to your site
  } catch (error) {
    res.status(500).json({ error: "Communication breakdown with Groq" });
  }
}