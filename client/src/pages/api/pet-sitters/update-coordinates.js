import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { user_id, lat, lng, address } = req.body;

      // ตรวจสอบว่าเป็นการเรียกจาก form submit จริงๆ หรือไม่
      const fromFormSubmit = req.headers["x-form-submit"] === "true";

      // ถ้าไม่ใช่การเรียกจาก form submit ให้ตอบกลับโดยไม่อัพเดตข้อมูลจริง
      if (!fromFormSubmit) {
        console.log(
          "Received update-coordinates request but ignored (not from form submit)"
        );
        return res.status(200).json({
          success: true,
          message: "Preview mode - no database update",
          coordinates: {
            lat: req.body.lat,
            lng: req.body.lng,
          },
        });
      }

      console.log("Updating coordinates:", { user_id, lat, lng });

      // อัพเดตค่า lat, lng โดยตรงด้วย Supabase
      const { data, error } = await supabase
        .from("pet_sitter")
        .update({ lat, lng })
        .eq("user_id", user_id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to update coordinates",
          error: error.message,
        });
      }

      const response = {
        success: true,
        message: "Coordinates updated successfully",
        data,
      };

      console.log("Coordinates updated successfully:", data);
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error updating coordinates:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update coordinates",
        error: error.message,
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
