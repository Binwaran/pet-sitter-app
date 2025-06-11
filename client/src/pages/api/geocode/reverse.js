import axios from "axios";

// Cache mechanism
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 1 day
const coordsCache = new Map();

export default async function handler(req, res) {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat/lng parameters" });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: "Invalid lat/lng format" });
    }

    // Round to 6 decimal places for cache key
    const roundedLat = Math.round(parsedLat * 1000000) / 1000000;
    const roundedLng = Math.round(parsedLng * 1000000) / 1000000;
    const cacheKey = `${roundedLat},${roundedLng}`;

    // Check cache
    const cachedResult = coordsCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      console.log("Returning cached reverse geocode result for:", cacheKey);
      return res.status(200).json(cachedResult.data);
    }

    console.log("Reverse geocoding coordinates:", cacheKey);

    // Call Nominatim API for reverse geocoding
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat: parsedLat,
          lon: parsedLng,
          format: "json",
          addressdetails: 1,
          zoom: 18,
          accept_language: "th,en",
        },
        headers: {
          "User-Agent": "pet-sitter-app/1.0",
        },
      }
    );

    // Save to cache
    coordsCache.set(cacheKey, {
      timestamp: Date.now(),
      data: response.data,
    });

    // Cache size management
    if (coordsCache.size > 1000) {
      const entries = [...coordsCache.entries()];
      const sortedEntries = entries.sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const entriesToDelete = sortedEntries.slice(
        0,
        Math.floor(entries.length / 2)
      );

      entriesToDelete.forEach(([key]) => {
        coordsCache.delete(key);
      });
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    res.status(500).json({ error: "Failed to reverse geocode coordinates" });
  }
}
