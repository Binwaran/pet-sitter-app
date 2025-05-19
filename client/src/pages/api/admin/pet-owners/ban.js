import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, action } = req.body; // action: 'ban' หรือ 'unban'

  if (!userId || !action) {
    return res.status(400).json({
      success: false,
      message: "User ID and action are required",
    });
  }

  if (!["ban", "unban"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Use 'ban' or 'unban'",
    });
  }

  try {
    const newStatus = action === "ban" ? "banned" : "normal";

    const { data, error } = await supabase
      .from("users")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .eq("role", "owner")
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to ${action} pet owner`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Pet owner ${
        action === "ban" ? "banned" : "unbanned"
      } successfully`,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
