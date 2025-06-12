import axios from "axios";

// Cache mechanism
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 1 day
const addressCache = new Map();

// เพิ่มการค้นหาแบบพิเศษสำหรับที่อยู่ในไทย
async function searchThaiAddress(query) {
  try {
    // ค้นหาด้วย OpenStreetMap Nominatim API
    const nominatimResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5, // เพิ่มจำนวนผลลัพธ์
          countrycodes: "th", // จำกัดเฉพาะประเทศไทย
        },
        headers: {
          "User-Agent": "pet-sitter-app/1.0",
        },
      }
    );

    if (nominatimResponse.data && nominatimResponse.data.length > 0) {
      // ในกรณีที่มีผลลัพธ์หลายรายการ เลือกอันที่น่าเชื่อถือที่สุด
      // โดยเรียงลำดับตามความสำคัญของ type ของสถานที่
      const resultsByPriority = nominatimResponse.data.sort((a, b) => {
        // ให้น้ำหนักกับที่อยู่ที่มีประเภทเฉพาะเจาะจงมากกว่า
        const typeOrder = {
          house: 1,
          building: 2,
          residential: 3,
          address: 4,
          neighbourhood: 5,
          suburb: 6,
          village: 7,
          town: 8,
          city: 9,
        };

        const aType = a.type || "";
        const bType = b.type || "";

        const aPriority = typeOrder[aType] || 100;
        const bPriority = typeOrder[bType] || 100;

        return aPriority - bPriority;
      });

      return resultsByPriority;
    }

    return [];
  } catch (error) {
    console.error("Error in searchThaiAddress:", error);
    throw error;
  }
}

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

    // ใช้ฟังก์ชัน search แบบพิเศษสำหรับที่อยู่ในไทย
    const searchResults = await searchThaiAddress(q);

    // บันทึก cache
    addressCache.set(cacheKey, {
      timestamp: Date.now(),
      data: searchResults,
    });

    // Management for cache size
    if (addressCache.size > 1000) {
      // ถ้า cache มีขนาดใหญ่เกินไป ให้ล้างครึ่งหนึ่งที่เก่าที่สุด
      const entries = [...addressCache.entries()];
      const sortedEntries = entries.sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const entriesToDelete = sortedEntries.slice(
        0,
        Math.floor(entries.length / 2)
      );

      entriesToDelete.forEach(([key]) => {
        addressCache.delete(key);
      });
    }

    res.status(200).json(searchResults);
  } catch (error) {
    console.error("Error in geocode search:", error);
    res.status(500).json({ error: "Failed to geocode address" });
  }
}
