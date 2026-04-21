/**
 * Reverse geocode lat/lon to a short place label (server-side proxy to OSM Nominatim).
 * Set GEOCODING_CONTACT in env to a URL or email for the User-Agent (Nominatim policy).
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return res.status(400).json({ error: "Invalid lat/lon" });
  }

  const contact = process.env.GEOCODING_CONTACT || "https://github.com/";
  const userAgent = `PortfolioSite/1.0 (${contact})`;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");

    const upstream = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": userAgent
      }
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Geocoding service unavailable" });
    }

    const d = await upstream.json();
    const a = d.address || {};
    const place =
      [a.city, a.town, a.village, a.hamlet, a.suburb, a.municipality].find(
        Boolean
      ) || "";
    const region = a.state || a.region || a.county || "";
    const country = a.country || "";
    const parts = [place, region, country].filter(Boolean);
    let label = parts.length ? parts.join(", ") : (d.display_name || "").split(",").slice(0, 3).join(",").trim();

    if (!label) {
      return res.status(404).json({ error: "No label" });
    }

    if (label.length > 140) label = label.slice(0, 137) + "…";

    return res.status(200).json({ label });
  } catch (err) {
    console.error("reverse-geocode:", err);
    return res.status(500).json({ error: "Geocoding failed" });
  }
}
