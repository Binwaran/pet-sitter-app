import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { user_id, status, admin_suggestion } = req.body;
    const { data, error } = await supabase
      .from("pet_sitter")
      .update({ status, admin_suggestion })
      .eq("user_id", user_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }
  res.status(405).json({ error: "Method not allowed" });
}