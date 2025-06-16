import { createClient } from "@supabase/supabase-js";

// สร้าง Supabase client ด้วย Service Role Key เพื่อให้มีสิทธิ์เขียนข้อมูล
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ใช้ service role key แทน anon key
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, reason } = req.body;
  if (!userId || !reason) {
    return res.status(400).json({ message: "Missing userId or reason" });
  }

  try {
    // ตรวจสอบว่ามีข้อมูลอยู่หรือไม่
    const { data: checkData, error: checkError } = await supabase
      .from("pet_sitter")
      .select("*")
      .eq("user_id", userId);

    if (checkError) {
      return res.status(500).json({ message: checkError.message });
    }

    if (!checkData || checkData.length === 0) {
      return res.status(404).json({ message: "Pet sitter not found" });
    }

    // ดำเนินการอัพเดท
    const { data: updateData, error } = await supabase
      .from("pet_sitter")
      .update({
        status: "rejected",
        admin_suggestion: reason,
        pending_data: null, // เพิ่มการล้าง pending_data เมื่อ reject เพื่อให้สอดคล้องกับ approve.js
      })
      .eq("user_id", userId)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // ถึงแม้การอัพเดทสำเร็จแต่ไม่มีข้อมูลกลับมา ให้ใช้ข้อมูลจาก checkData
    return res.status(200).json({
      success: true,
      message: "Rejected successfully",
      data:
        updateData && updateData.length > 0
          ? updateData[0]
          : {
              ...checkData[0],
              status: "rejected",
              admin_suggestion: reason,
              pending_data: null, // เพิ่มให้สอดคล้องกับการอัพเดทข้างบน
            },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", details: err.message });
  }
}
