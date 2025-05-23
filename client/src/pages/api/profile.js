import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized: No user_id" });
  }

  // ตรวจสอบ user และ role
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id,role")
    .eq("id", user_id)
    .single();

  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized: User not found" });
  }
  if (user.role !== "owner") {
    return res.status(403).json({ error: "Forbidden: Not owner role" });
  }

  if (req.method === "GET") {
    // ดึงข้อมูลโปรไฟล์
    const { data, error } = await supabase
      .from("users")
      .select("name,email,phone,birthday,profile_image_url")
      .eq("id", user_id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { name, email, phone, birthday, profile_image_url } = req.body;

    // Validate ข้อมูลเบื้องต้น
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone are required." });
    }

    // อัปเดตข้อมูล user ที่มีอยู่เท่านั้น
    const { error } = await supabase
      .from("users")
      .update({ name, email, phone, birthday, profile_image_url })
      .eq("id", user_id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Profile updated" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}