import { createClient } from "@supabase/supabase-js";

// สร้าง Supabase client ด้วย Service Role Key เพื่อให้มีสิทธิ์เขียนข้อมูล
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ใช้ service role key แทน anon key
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  console.log("Processing approval request for userId:", userId);

  try {
    // ตรวจสอบว่ามีข้อมูลและ pending_data อยู่หรือไม่
    const { data: checkData, error: checkError } = await supabase
      .from("pet_sitter")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (checkError) {
      console.error("Check error:", checkError);
      return res.status(500).json({ message: checkError.message });
    }

    if (!checkData) {
      console.error("Pet sitter not found with userId:", userId);
      return res.status(404).json({ message: "Pet sitter not found" });
    }

    if (!checkData.pending_data) {
      console.error("No pending data found for approval");
      return res
        .status(400)
        .json({ message: "No pending data found for approval" });
    }

    // นำข้อมูลจาก pending_data มาอัพเดทเป็นข้อมูลหลัก
    const pendingData = checkData.pending_data;
    const userData = pendingData?.user_data || {};
    // Extract pet sitter data, making sure to remove date_of_birth if present
    const petSitterData = { ...pendingData?.pet_sitter_data } || {};
    
    // Remove date_of_birth from petSitterData if it exists
    if (petSitterData.date_of_birth !== undefined) {
      delete petSitterData.date_of_birth;
    }

    // อัพเดทข้อมูล users table ก่อน (ถ้ามี)
    if (Object.keys(userData).length > 0) {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          name: userData.name || checkData.users?.name,
          email: userData.email || checkData.users?.email,
          phone: userData.phone || checkData.users?.phone,
          birthday: userData.birthday || userData.date_of_birth || checkData.users?.birthday, // Add birthday field
          profile_image_url:
            checkData.pending_profile_image_url ||
            userData.profile_image_url ||
            checkData.users?.profile_image_url,
        })
        .eq("id", userId);

      if (userUpdateError) {
        console.error("Error updating user data:", userUpdateError);
        return res.status(500).json({ message: userUpdateError.message });
      }
    }
    

    // อัพเดทข้อมูล pet_sitter table
    const { data: updateData, error: updateError } = await supabase
      .from("pet_sitter")
      .update({
        ...petSitterData,
        // อัพเดทรูปแกลเลอรี่จาก pending เป็นรูปหลัก
        gallery_image_url:
          checkData.pending_gallery_image_url || checkData.gallery_image_url,
        status: "approved",
        admin_suggestion: null,
        // ล้างข้อมูล pending
        pending_data: null,
        pending_profile_image_url: null,
        pending_gallery_image_url: null,
      })
      .eq("user_id", userId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: updateError.message });
    }

    return res.status(200).json({
      success: true,
      message: "Approved successfully",
      data: updateData[0],
    });
  } catch (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", details: err.message });
  }
}
