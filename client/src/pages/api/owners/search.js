import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { search = "" } = req.query;
  const limit = 8; // จำกัดผลลัพธ์สูงสุด

  // ใช้ ilike ของ Supabase เพื่อป้องกัน SQL Injection อัตโนมัติ
  let query = supabase
    .from("users")
    .select("id, name, phone, email, birthday, profile_image_url")
    .eq("role", "owner")
    .limit(limit)
    .order("name", { ascending: true });

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}