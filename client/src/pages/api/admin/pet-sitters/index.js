import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("pet_sitter")
      .select(
        `
        *,
        users:users!pet_sitter_user_id_fkey (
          name,
          email,
          profile_image_url,
          role
        )
      `
      )
      .eq("users.role", "sitter")
      .order("updated_at", { ascending: false }) // เรียงตาม updated_at ล่าสุดขึ้นก่อน
      .order("created_at", { ascending: false }); // ถ้าไม่มี updated_at ให้เรียงตาม created_at

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const VALID_STATUSES = ["approved", "rejected", "waiting for approval"];

    const formatted = data.map((sitter) => {
      const normalizedStatus = sitter.status?.toLowerCase();
      return {
        user_id: sitter.user_id,
        full_name: sitter.users?.name,
        email: sitter.users?.email,
        profile_image_url: sitter.users?.profile_image_url,
        trade_name: sitter.trade_name,
        status: VALID_STATUSES.includes(normalizedStatus)
          ? normalizedStatus
          : "Unknown",
        created_at: sitter.created_at, // เพิ่มเวลาที่สร้าง
        updated_at: sitter.updated_at, // เพิ่มเวลาที่อัพเดท
      };
    });

    return res.status(200).json({ data: formatted });
  }

  res.status(405).json({ error: "Method not allowed" });
}
