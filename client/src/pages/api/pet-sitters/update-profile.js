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

        // เพิ่มข้อมูลพิกัดที่รออนุมัติจาก pending_data
        // พิกัดปัจจุบันที่อนุมัติแล้ว
        lat: petSitter?.lat || null,
        lng: petSitter?.lng || null,

        // พิกัดที่รออนุมัติ (จาก pending_data)
        pending_lat: petSitter?.pending_data?.pet_sitter_data?.lat || null,
        pending_lng: petSitter?.pending_data?.pet_sitter_data?.lng || null,

        // มีพิกัดที่รออนุมัติหรือไม่
        has_pending_location: !!(
          petSitter?.pending_data?.pet_sitter_data?.lat !== undefined &&
          petSitter?.pending_data?.pet_sitter_data?.lng !== undefined
        ),
        // เพิ่มข้อมูลสำหรับการตรวจสอบว่ามีรูปที่รออนุมัติหรือไม่
        display_profile_image_url:
          petSitter?.pending_profile_image_url ||
          userData?.profile_image_url ||
          null,
        display_gallery_image_url:
          petSitter?.pending_gallery_image_url ||
          petSitter?.gallery_image_url ||
          [],
        // แก้ไขตรงนี้: ตรวจสอบว่าค่า pending แตกต่างจากค่าปัจจุบันหรือไม่
        has_pending_profile:
          !!petSitter?.pending_profile_image_url &&
          petSitter?.pending_profile_image_url !== userData?.profile_image_url,
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
      const isFormSubmit = req.headers["x-form-submit"] === "true";

      if (!isFormSubmit) {
        return res.status(400).json({
          error:
            "Missing form submission header. This API should only be called from form submit.",
        });
      }

      // แยกข้อมูลสำหรับตาราง users และ pet_sitter
      const userUpdateData = {
        name: updateData.full_name,
        email: updateData.email,
        phone: updateData.phone_number,
      };

      // ตรวจสอบว่ามีโปรไฟล์ pet_sitter อยู่แล้วหรือไม่
      const { data: existingProfile, error: profileError } = await supabase
        .from("pet_sitter")
        .select("*") // เปลี่ยนเป็นดึงข้อมูลทั้งหมดเพื่อใช้ในการเปรียบเทียบ
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

      // ตรวจสอบว่าพิกัดมีการเปลี่ยนแปลงหรือไม่
      const isLocationChanged =
        (updateData.lat !== undefined &&
          updateData.lat !== existingProfile.lat) ||
        (updateData.lng !== undefined &&
          updateData.lng !== existingProfile.lng);

      console.log("Location changed:", isLocationChanged);

      // ถ้ามีการเปลี่ยนแปลงพิกัด ให้เก็บในข้อมูลที่รออนุมัติ
      if (
        isLocationChanged &&
        updateData.lat !== undefined &&
        updateData.lng !== undefined
      ) {
        // เก็บพิกัดใหม่ใน petSitterData
        petSitterData.lat = updateData.lat;
        petSitterData.lng = updateData.lng;
      }

      // ตรวจสอบว่ารูปมีการเปลี่ยนแปลงหรือไม่
      const isProfileImageChanged =
        updateData.profile_image_url !== existingProfile.profile_image_url;

      // เปรียบเทียบ gallery images
      let isGalleryChanged = false;
      const currentGallery = existingProfile.gallery_image_url || [];
      const newGallery = updateData.gallery_image_url || [];

      // ตรวจสอบเปรียบเทียบ arrays
      if (Array.isArray(currentGallery) && Array.isArray(newGallery)) {
        if (currentGallery.length !== newGallery.length) {
          isGalleryChanged = true;
        } else {
          // ตรวจสอบแต่ละ element
          isGalleryChanged = !currentGallery.every(
            (url, index) => url === newGallery[index]
          );
        }
      } else if (
        JSON.stringify(currentGallery) !== JSON.stringify(newGallery)
      ) {
        // กรณี format ไม่ใช่ array ให้เทียบเป็น string
        isGalleryChanged = true;
      }

      console.log("Profile image changed:", isProfileImageChanged);
      console.log("Gallery changed:", isGalleryChanged);

      // สร้างข้อมูลที่จะอัปเดต
      const updateFields = {
        status: "waiting for approval",
        pending_data: pendingData,
      };

      // เพิ่มข้อมูลรูปภาพที่รออนุมัติเฉพาะเมื่อมีการเปลี่ยนแปลง
      if (isProfileImageChanged) {
        updateFields.pending_profile_image_url = updateData.profile_image_url;
      }

      if (isGalleryChanged) {
        updateFields.pending_gallery_image_url = updateData.gallery_image_url;
      }

      // อัปเดตข้อมูล pet_sitter
      const { data: updatedProfile, error: updateError } = await supabase
        .from("pet_sitter")
        .update(updateFields)
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
      };

      // เพิ่มข้อมูลรูปที่รออนุมัติเฉพาะเมื่อมีการเปลี่ยนแปลง
      if (isProfileImageChanged) {
        completeProfile.pending_profile_image_url =
          updateData.profile_image_url;
      }

      if (updateData.lat && updateData.lng) {
        petSitterData.lat = updateData.lat;
        petSitterData.lng = updateData.lng;
      }

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
