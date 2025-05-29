import { supabase } from "../../../services/supabaseClient";

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
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}