import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Missing booking id" });
  }

  try {
    // Get token from cookie
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify JWT token
    let userData;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.user_id || decoded.sub;

      if (!userId) {
        return res.status(401).json({ message: "Invalid user ID in token" });
      }

      userData = { user: { id: userId } };
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = userData.user.id;

    // First, check if the booking belongs to this sitter
    const { data: bookingCheck, error: checkError } = await supabase
      .from("booking")
      .select("booking_id, sitter_id, status")
      .eq("booking_id", id)
      .eq("sitter_id", userId)
      .single();

    if (checkError) {
      console.error("Error checking booking:", checkError);
      return res.status(500).json({ message: "Failed to verify booking" });
    }

    if (!bookingCheck) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status to cancelled
    const { data: updateData, error: updateError } = await supabase
      .from("booking")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", id)
      .eq("sitter_id", userId)
      .select();

    if (updateError) {
      console.error("Error updating booking status:", updateError);
      return res.status(500).json({ message: "Failed to reject booking" });
    }

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      data: updateData[0],
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
