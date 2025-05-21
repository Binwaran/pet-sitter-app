import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  const { user_id } = req.query;

  // ตรวจสอบ user_id ว่ามีจริงไหม
  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized: No user_id" });
  }

  // ดึง role ของ user จาก database
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("role")
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
    // อัปเดตหรือเพิ่มข้อมูลโปรไฟล์
    const { name, email, phone, birthday, profile_image_url } = req.body;
    // เช็คว่ามี user นี้อยู่หรือยัง
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();

    if (existing) {
      // อัปเดต
      const { error } = await supabase
        .from("users")
        .update({ name, email, phone, birthday, profile_image_url })
        .eq("id", user_id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ message: "Profile updated" });
    } else {
      // เพิ่มใหม่
      const { error } = await supabase
        .from("users")
        .insert([{ id: user_id, name, email, phone, birthday, profile_image_url }]);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ message: "Profile created" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}