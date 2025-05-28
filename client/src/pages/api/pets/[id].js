import { supabase } from "@/services/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;


  if (req.method === "PUT") {
    const data = req.body;

    // อัปเดตข้อมูล pet

    // อัปเดตข้อมูล pet
    const { data: pet, error } = await supabase
      .from("pets")
      .update(data)
      .eq("pet_id", id)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // ตรวจสอบ pet_id(s) ใน table users
    if (pet && pet.owner_id) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("pet_id(s)")
        .eq("id", pet.owner_id)
        .single();

      if (!userError) {
        let petIds = [];
        if (user && user["pet_id(s)"]) {
          try {
            petIds = JSON.parse(user["pet_id(s)"]);
            if (!Array.isArray(petIds)) petIds = [];
          } catch {
            petIds = [];
          }
        }

        // ถ้า pet_id ยังไม่มีใน pet_id(s) ให้เพิ่มเข้าไป
        if (!petIds.includes(pet.pet_id)) {
          petIds.push(pet.pet_id);
          await supabase
            .from("users")
            .update({ "pet_id(s)": JSON.stringify(petIds) })
            .eq("id", pet.owner_id);
        }
      }
    }

    res.json(pet);
  } else if (req.method === "GET") {
    // ดึงข้อมูล pet รายตัว
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq("pet_id", id)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({ error: "Pet not found" });
    }
    if (error) return res.status(400).json({ error: error.message });
    if (!pet) return res.status(404).json({ error: "Pet not found" });

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