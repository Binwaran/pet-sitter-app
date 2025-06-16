import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ดึง token จาก cookie
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    // 1. Get the viewed booking IDs
    const { data: viewedData } = await supabase
      .from("viewed_bookings")
      .select("booking_id")
      .eq("user_id", userId);

    const viewedBookingIds = viewedData
      ? viewedData.map((item) => item.booking_id)
      : [];

    // 2. Query booking table to check if there are any bookings not in the viewed list
    let query = supabase
      .from("booking")
      .select("booking_id", { count: "exact", head: true })
      .eq("sitter_id", userId);

    // Apply filter only if there are viewed bookings
    if (viewedBookingIds.length > 0) {
      query = query.not("booking_id", "in", `(${viewedBookingIds.join(",")})`);
    }

    const { count, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      hasUnread: (count || 0) > 0,
      unreadCount: count || 0,
    });
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}
