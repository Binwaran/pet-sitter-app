import { supabase } from "@/services/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === "PUT") {
    const data = req.body;
    // อัปเดตข้อมูล pet ใน Supabase
    const { data: pet, error } = await supabase
      .from("pets")
      .update(data)
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(pet);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}