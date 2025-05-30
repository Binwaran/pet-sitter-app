import { supabase } from "@/services/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    // ดึง booking รายตัว
    const { data: booking, error } = await supabase
      .from("booking")
      .select("*")
      .eq("booking_id", id)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (error) return res.status(400).json({ error: error.message });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } else if (req.method === "PUT" || req.method === "PATCH") {
    // อัปเดต booking
    const data = req.body;
    const { data: booking, error } = await supabase
      .from("booking")
      .update(data)
      .eq("booking_id", id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(booking);
  } else if (req.method === "DELETE") {
    // ลบ booking
    const { error } = await supabase
      .from("booking")
      .delete()
      .eq("booking_id", id);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: "Booking deleted" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}