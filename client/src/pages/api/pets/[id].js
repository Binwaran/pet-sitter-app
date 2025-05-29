import { supabase } from "@/services/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;


  if (req.method === "PUT") {
    const data = req.body;
    // อัปเดตข้อมูล pet ใน Supabase

    // อัปเดตข้อมูล pet

    // อัปเดตข้อมูล pet
    const { data: pet, error } = await supabase
      .from("pets")
      .update(data)
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(pet);
  } else if (req.method === "DELETE") {
    // ลบ pet ออกจากฐานข้อมูล
    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("pet_id", id);

    if (error) return res.status(400).json({ error: error.message });

    // (Optional) ลบ pet_id ออกจาก users.pet_id(s) ด้วย ถ้ายังใช้ field นี้
    // ถ้าไม่ใช้แล้ว ข้ามส่วนนี้ได้เลย

    return res.status(200).json({ message: "Pet deleted" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}