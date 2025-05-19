import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { user_id, email, phone_number, ...profileData } = req.body;

    // เช็ค email ซ้ำใน users (ยกเว้น user ตัวเอง)
    const { data: emailUsers, error: emailError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", user_id);

    if (emailError) return res.status(500).json({ error: emailError.message });
    if (emailUsers && emailUsers.length > 0) {
      return res.status(400).json({ error: "This email is already in use." });
    }

    // เช็ค phone_number ซ้ำใน users (ยกเว้น user ตัวเอง)
    const { data: phoneUsers, error: phoneError } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone_number)
      .neq("id", user_id);

    if (phoneError) return res.status(500).json({ error: phoneError.message });
    if (phoneUsers && phoneUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "This phone number is already in use." });
    }

    // upsert: ถ้ามี user_id นี้อยู่แล้วจะ update, ถ้าไม่มีก็ insert
    const { data, error } = await supabase
      .from("pet_sitter")
      .upsert([{ user_id, email, phone_number, ...profileData }], {
        onConflict: "user_id",
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  if (req.method === "GET") {
    const { user_id } = req.query;
    const { data, error } = await supabase
      .from("pet_sitter")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  res.status(405).json({ error: "Method not allowed" });
}
