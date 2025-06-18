import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { booking_ids } = req.body;
  if (!Array.isArray(booking_ids) || booking_ids.length === 0) {
    return res.status(400).json({ error: "No booking_ids provided" });
  }
  const { data, error } = await supabase
    .from("reviews")
    .select("booking_id")
    .in("booking_id", booking_ids);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  // สร้าง map { booking_id: true }
  const reviewed = {};
  data.forEach(r => { reviewed[r.booking_id] = true; });
  res.status(200).json({ reviewed });
}