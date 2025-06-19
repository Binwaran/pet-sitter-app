import { supabase } from "@/services/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // ดึง booking ทั้งหมด หรือ filter ด้วย owner_id/sitter_id
    const { owner_id, sitter_id } = req.query;
    let query = supabase.from("booking").select("*");
    if (owner_id) query = query.eq("owner_id", owner_id);
    if (sitter_id) query = query.eq("sitter_id", sitter_id);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } else if (req.method === "POST") {
    // สร้าง booking ใหม่
    const data = req.body;
    const { data: booking, error } = await supabase
      .from("booking")
      .insert([data])
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(booking);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}