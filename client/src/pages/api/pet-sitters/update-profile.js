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
        // เพิ่มข้อมูลสำหรับการตรวจสอบว่ามีรูปที่รออนุมัติหรือไม่
        display_profile_image_url:
          petSitter?.pending_profile_image_url ||
          userData?.profile_image_url ||
          null,
        display_gallery_image_url:
          petSitter?.pending_gallery_image_url ||
          petSitter?.gallery_image_url ||
          [],
        has_pending_profile: !!petSitter?.pending_profile_image_url,
        has_pending_gallery:
          Array.isArray(petSitter?.pending_gallery_image_url) &&
          petSitter.pending_gallery_image_url.length > 0,
      };

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
        // ไม่อัพเดทรูปโปรไฟล์โดยตรง ให้ใช้ pending_profile_image_url แทน
        // profile_image_url: updateData.profile_image_url,
      };

      // ตรวจสอบว่ามีโปรไฟล์ pet_sitter อยู่แล้วหรือไม่
      const { data: existingProfile, error: profileError } = await supabase
        .from("pet_sitter")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error finding profile:", profileError);
        return res.status(500).json({ error: profileError.message });
      }

      // ลบข้อมูลที่ไปอัปเดตที่ users table แล้ว
      const petSitterData = { ...updateData };
      delete petSitterData.full_name;
      delete petSitterData.email;
      delete petSitterData.profile_image_url;
      delete petSitterData.phone_number;

      // สร้าง pending_data ที่เก็บข้อมูลทั้งหมดที่รออนุมัติ (คงเอาไว้เพื่อ backward compatibility)
      const pendingData = {
        user_data: {
          ...userUpdateData,
          profile_image_url: updateData.profile_image_url, // เก็บรูปใน pending_data ด้วย
        },
        pet_sitter_data: petSitterData, // ข้อมูลสำหรับ pet_sitter table
      };

      if (!existingProfile) {
        // สร้างโปรไฟล์ใหม่ถ้าไม่มี
        const { data: newProfile, error: createError } = await supabase
          .from("pet_sitter")
          .insert([
            {
              user_id: userId,
              status: "waiting for approval",
              pending_data: pendingData,
              // เพิ่มคอลัมน์ใหม่สำหรับรูปที่รออนุมัติ
              pending_profile_image_url: updateData.profile_image_url,
              pending_gallery_image_url: updateData.gallery_image_url,
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
          message: "Profile created successfully, waiting for approval",
          data: completeProfile,
        });
      }

      // อัปเดตข้อมูล pet_sitter เฉพาะสถานะและ pending_data
      const { data: updatedProfile, error: updateError } = await supabase
        .from("pet_sitter")
        .update({
          status: "waiting for approval",
          pending_data: pendingData,
          // เพิ่มคอลัมน์ใหม่สำหรับรูปที่รออนุมัติ
          pending_profile_image_url: updateData.profile_image_url,
          pending_gallery_image_url: updateData.gallery_image_url,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return res.status(500).json({ error: updateError.message });
      }

      // รวมข้อมูลทั้งหมดสำหรับส่งกลับ
      const completeProfile = {
        ...updatedProfile,
        full_name: userUpdateData.name,
        email: userUpdateData.email,
        phone_number: userUpdateData.phone,
        profile_image_url: updatedProfile.profile_image_url, // แสดงรูปเดิมที่อนุมัติแล้ว
        pending_profile_image_url: updateData.profile_image_url, // เพิ่มข้อมูลรูปที่รออนุมัติ
      };

      return res.status(200).json({
        success: true,
        message: "Profile update request submitted, waiting for approval",
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
