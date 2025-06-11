import axios from "axios";

// Cache mechanism
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 1 day
const addressCache = new Map();

export default async function handler(req, res) {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Missing query parameter" });
    }
    
    // สร้าง cache key
    const cacheKey = q.toLowerCase().trim();
    const cachedResult = addressCache.get(cacheKey);
    
    // ตรวจสอบว่ามีผลลัพธ์ใน cache หรือไม่
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      console.log("Returning cached geocode result for:", q);
      return res.status(200).json(cachedResult.data);
    }
    
    // ถ้าไม่มี cache หรือ cache หมดอายุแล้ว ดึงข้อมูลใหม่
    console.log("Geocoding address:", q);
    
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q,
          format: "json",
          addressdetails: 1,
          limit: 1,
        },
        headers: {
          "User-Agent": "pet-sitter-app/1.0",
        },
      }
    );
    
    // บันทึก cache
    addressCache.set(cacheKey, {
      timestamp: Date.now(),
      data: response.data,
    });
    
    // Management for cache size
    if (addressCache.size > 1000) {
      // ถ้า cache มีขนาดใหญ่เกินไป ให้ล้างครึ่งหนึ่งที่เก่าที่สุด
      const entries = [...addressCache.entries()];
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToDelete = sortedEntries.slice(0, Math.floor(entries.length / 2));
      
      entriesToDelete.forEach(([key]) => {
        addressCache.delete(key);
      });
    }
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in geocode search:", error);
    res.status(500).json({ error: "Failed to geocode address" });
  }
}