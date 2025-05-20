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
      .eq("users.role", "sitter");

    if (error) {
      console.error("Supabase error:", error); // 👈 เพิ่มตรงนี้
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
          : "-", // "waiting for approval" หรือ "-" หรือ "unknown"
      };
    });

    return res.status(200).json({ data: formatted });
  }

  res.status(405).json({ error: "Method not allowed" });
}
