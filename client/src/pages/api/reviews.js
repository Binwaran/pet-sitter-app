import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { booking_id, sitter_id, reviewer_id, rating, comment } = req.body;

      if (!booking_id || !sitter_id || !reviewer_id || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            booking_id,
            sitter_id,
            reviewer_id,
            rating,
            comment,
            verified: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === "GET") {
    const { booking_id } = req.query;
    if (!booking_id) {
      return res.status(400).json({ error: "Missing booking_id" });
    }
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("booking_id", booking_id)
      .single();
    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json({ data });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}