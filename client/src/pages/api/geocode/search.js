import axios from 'axios';

export default async function handler(req, res) {
  const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY; // ใส่ใน .env.local
  
  // ตรวจสอบว่ามี API key หรือไม่
  if (!OPENCAGE_API_KEY) {
    console.error('Missing OpenCage API key in environment variables');
    return res.status(500).json({ error: 'Server configuration error: Missing API key' });
  }
  
  const { province, district, subDistrict, postalCode, addressDetail, q } = req.query;
  
  // สร้างสตริงที่อยู่ - เพิ่มการตรวจสอบและทำความสะอาดข้อมูล
  const addressString = q || 
    `${addressDetail || ''}, ${subDistrict || ''}, ${district || ''}, ${province || ''}, ${postalCode || ''}, Thailand`
      .replace(/,\s*,/g, ',') // ลบคอมม่าซ้อน
      .replace(/^,\s*/, '')   // ลบคอมม่าที่ขึ้นต้น
      .trim();
  
  console.log("Geocoding search request for:", addressString);
  
  if (!addressString || addressString === ', , , , Thailand') {
    return res.status(400).json({ error: 'Empty or insufficient address information' });
  }
  
  try {
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: addressString,
        key: OPENCAGE_API_KEY,
        language: 'en',         // ใช้ภาษาอังกฤษสำหรับผลลัพธ์
        countrycode: 'th',      // ค้นหาในประเทศไทยเท่านั้น
        limit: 1,               // จำกัดผลลัพธ์แค่ 1 รายการ
        no_annotations: 0,      // ต้องการข้อมูล annotations (สำหรับ OSM ID)
        abbrv: 1,               // ย่อข้อความที่ไม่จำเป็น
        min_confidence: 3       // ความมั่นใจในผลลัพธ์ (1-10, 10 = แม่นยำสูงสุด)
      },
      timeout: 5000             // timeout หลังจาก 5 วินาที
    });
    
    // ตรวจสอบสถานะจาก OpenCage
    if (response.data.status && response.data.status.code !== 200) {
      console.error('OpenCage API error:', response.data.status);
      return res.status(response.data.status.code).json({ 
        error: `OpenCage error: ${response.data.status.message}` 
      });
    }
    
    // ตรวจสอบว่ามีผลลัพธ์หรือไม่
    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      // เช็คว่าผลลัพธ์มีความแม่นยำเพียงพอหรือไม่
      if (result.confidence < 3) {
        console.warn(`Low confidence geocoding result (${result.confidence}/10) for: ${addressString}`);
      }
      
      const results = [{
        lat: result.geometry.lat.toString(),
        lon: result.geometry.lng.toString(),
        display_name: result.formatted,
        place_id: result.annotations?.osm?.type + result.annotations?.osm?.id || `opencage-${Date.now()}`,
        confidence: result.confidence,
        components: result.components // ส่งข้อมูลองค์ประกอบที่อยู่กลับไปด้วย
      }];
      
      return res.status(200).json(results);
    } else {
      console.log(`No geocoding results found for address: ${addressString}`);
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error searching geocode data:', error.message);
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json({ 
      error: 'Failed to search geocode data',
      details: error.message,
      request: addressString
    });
  }
}