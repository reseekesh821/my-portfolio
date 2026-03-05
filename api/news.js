export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration error (Missing NEWS_API_KEY)" });
  }

  try {
    const params = new URLSearchParams({
      category: "general",
      lang: "en",
      max: "10",
      apikey: apiKey
    });
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?${params.toString()}`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("GNews API error:", response.status, text);
      return res.status(response.status).json({ error: "News service unavailable" });
    }

    const data = await response.json();
    const articles = (data.articles || []).map((a) => ({
      title: a.title || "",
      url: a.url || "#",
      description: a.description || "",
      publishedAt: a.publishedAt || "",
      source: (a.source && a.source.name) ? a.source.name : ""
    }));

    return res.status(200).json({ articles });
  } catch (error) {
    console.error("News API error:", error);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
}
