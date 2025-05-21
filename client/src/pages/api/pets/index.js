import { supabase } from "@/services/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { ownerId } = req.query;
    if (!ownerId) return res.status(400).json({ error: "ownerId is required" });

    // ดึง pet ตัวแรกของ owner (หรือจะใช้ .select("*") เพื่อดึงทั้งหมดก็ได้)
    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("ownerId", ownerId)
      .limit(1);

    if (error) return res.status(400).json({ error: error.message });
    if (!pets || pets.length === 0) return res.status(404).json({ error: "Pet not found" });

    res.json(pets[0]);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}