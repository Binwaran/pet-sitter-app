import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { userId } = req.query;

    const { data, error } = await supabase
      .from("pet_sitter")
      .select(
        `
    *,
    users:users!pet_sitter_user_id_fkey (
      id,
      name,
      email,
      phone,
      birthday,
      profile_image_url
    )
  `
      )
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error?.message || "Not found" });
    }

    return res.status(200).json({
      data: {
        users: data.users,
        pet_sitter: {
          ...data,
          users: undefined,
        },
      },
    });
  }
  res.status(405).json({ error: "Method not allowed" });
}
