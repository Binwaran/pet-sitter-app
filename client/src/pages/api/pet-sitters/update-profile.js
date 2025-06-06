import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // รองรับเฉพาะ GET และ POST (สำหรับการอัปเดต)
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ดึง token จาก cookie
    const token = req.cookies.token;
    console.log("Token exists:", !!token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;
    console.log("User ID from token:", userId);

    if (!userId) {
      return res.status(401).json({ error: "Invalid token: No user ID" });
    }

    // สำหรับ GET request - ดึงข้อมูล pet sitter และ users
    if (req.method === "GET") {
      console.log("Processing GET request for user ID:", userId);

      // 1. ดึงข้อมูลจากตาราง users ก่อน
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("name, email, phone, profile_image_url")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return res.status(500).json({ error: userError.message });
      }

      // 2. ดึงข้อมูลจากตาราง pet_sitter
      const { data: petSitter, error } = await supabase
        .from("pet_sitter")
        .select("*")
        .eq("user_id", userId)
        .single();

      // รวมข้อมูลจากทั้งสองตาราง
      const combinedData = {
        ...(petSitter || {}),
        full_name: userData?.name || "",
        email: userData?.email || "",
        phone_number: userData?.phone || "",
        profile_image_url: userData?.profile_image_url || null,
      };

      if (error && error.code !== "PGRST116") {
        // PGRST116 คือ not found ซึ่งยอมรับได้
        console.error("Database error:", error);
        return res.status(500).json({ error: error.message });
      }

      if (!petSitter && !userData) {
        console.log("No data found for user ID:", userId);
        return res.status(404).json({ error: "Profile not found" });
      }

      console.log("Profile data retrieved successfully");
      return res.status(200).json({ data: combinedData });
    }

    // สำหรับ POST request (จาก client) - อัปเดตข้อมูล
    if (req.method === "POST") {
      console.log("Processing POST request for user ID:", userId);
      const updateData = req.body;

      // แยกข้อมูลสำหรับตาราง users และ pet_sitter
      const userUpdateData = {
        name: updateData.full_name,
        email: updateData.email,
        phone: updateData.phone_number,
        profile_image_url: updateData.profile_image_url,
      };

      // อัปเดตข้อมูลในตาราง users ก่อน
      const { error: userUpdateError } = await supabase
        .from("users")
        .update(userUpdateData)
        .eq("id", userId);

      if (userUpdateError) {
        console.error("Error updating user data:", userUpdateError);
        return res.status(500).json({ error: userUpdateError.message });
      }

      // ตรวจสอบว่ามีโปรไฟล์ pet_sitter อยู่แล้วหรือไม่
      const { data: existingProfile, error: profileError } = await supabase
        .from("pet_sitter")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error finding profile:", profileError);
        return res.status(500).json({ error: profileError.message });
      }

      // ลบข้อมูลที่ไปอัปเดตที่ users table แล้ว
      const petSitterData = { ...updateData };
      delete petSitterData.full_name; // ใช้ trade_name แทน
      delete petSitterData.email; // อยู่ใน users table
      delete petSitterData.profile_image_url; // อยู่ใน users table

      if (!existingProfile) {
        console.log("No existing profile found, creating new one...");
        // สร้างโปรไฟล์ใหม่ถ้าไม่มี
        const { data: newProfile, error: createError } = await supabase
          .from("pet_sitter")
          .insert([
            {
              ...petSitterData,
              user_id: userId,
              status: "waiting for approval",
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          return res.status(500).json({ error: createError.message });
        }

        // รวมข้อมูลทั้งหมดสำหรับส่งกลับ
        const completeProfile = {
          ...newProfile,
          ...userUpdateData,
          full_name: userUpdateData.name,
        };

        return res.status(201).json({
          success: true,
          message: "Profile created successfully",
          data: completeProfile,
        });
      }

      // อัปเดตข้อมูล pet_sitter
      console.log("Updating existing profile...");
      const { data: updatedProfile, error: updateError } = await supabase
        .from("pet_sitter")
        .update({ ...petSitterData, status: "waiting for approval" })
        .eq("id", existingProfile.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return res.status(500).json({ error: updateError.message });
      }

      // รวมข้อมูลทั้งหมดสำหรับส่งกลับ
      const completeProfile = {
        ...updatedProfile,
        ...userUpdateData,
        full_name: userUpdateData.name,
      };

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: completeProfile,
      });
    }
  } catch (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
