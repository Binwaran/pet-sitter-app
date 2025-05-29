import { supabase } from "@/services/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { ownerId } = req.query;
    if (!ownerId) return res.status(400).json({ error: "ownerId is required" });

    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", ownerId);

    if (error) return res.status(400).json({ error: error.message });
    res.json(pets || []);
  } else if (req.method === "POST") {
    const data = req.body;

    // สร้าง pet ใหม่
    const { data: pet, error } = await supabase
      .from("pets")
      .insert([data])
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // เพิ่ม pet_id ลงใน users.pet_id(s)
    if (pet && pet.owner_id) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("pet_id(s)")
        .eq("id", pet.owner_id)
        .single();

      if (!userError) {
        let petIds = Array.isArray(user["pet_id(s)"]) ? user["pet_id(s)"] : [];
        petIds.push(pet.pet_id);

        // อัปเดต pet_id(s) ใน users (ไม่ต้อง stringify)
        await supabase
          .from("users")
          .update({ "pet_id(s)": petIds })
          .eq("id", pet.owner_id);
      }
    }

    res.status(201).json(pet);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}