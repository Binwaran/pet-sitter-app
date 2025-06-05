import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ดึง token จาก cookie
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    console.log("Attempting to mark booking as viewed:", {
      user_id: userId,
      booking_id: bookingId,
    });

    // ตรวจสอบว่ามีบันทึกอยู่แล้วหรือไม่
    const { data: existingRecord, error: checkError } = await supabase
      .from("viewed_bookings")
      .select("*")
      .eq("user_id", userId)
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (checkError && !checkError.message.includes("No rows found")) {
      console.error("Error checking existing record:", checkError);
      return res.status(500).json({ error: checkError.message });
    }

    // ถ้ามีข้อมูลอยู่แล้ว ส่งคืน success เลย
    if (existingRecord) {
      return res.status(200).json({ success: true });
    }

    // ใช้การ RPC เพื่อจัดการกับการแปลงข้อมูลในฝั่งเซิร์ฟเวอร์
    // วิธีการนี้จะช่วยให้ PostgreSQL จัดการกับข้อมูลได้ถูกต้องกว่า
    try {
      const { data, error } = await supabase.rpc("safe_mark_booking_viewed", {
        p_user_id: userId,
        p_booking_id: bookingId,
      });

      if (error) {
        console.error("RPC error:", error);
        return res.status(500).json({
          error: error.message,
          hint: "Server function error. Please check database function and permissions.",
        });
      }

      return res.status(200).json({ success: true });
    } catch (insertErr) {
      console.error("Unexpected insert error:", insertErr);
      return res.status(500).json({
        error: "Database operation failed",
        message: insertErr.message,
      });
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
}
