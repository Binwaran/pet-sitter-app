import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// เพิ่มตัวเลือกเพื่อปรับปรุงการเชื่อมต่อ WebSocket
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
    timeout: 60000, // เพิ่มเวลา timeout เป็น 60 วินาที
    reconnect: true,
    heartbeat: {
      interval: 30000, // ส่ง heartbeat ทุก 30 วินาที
    },
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

// สำหรับความเข้ากันได้ย้อนหลัง (ถ้ามีโค้ดที่ import แบบ default)
export default supabase;
