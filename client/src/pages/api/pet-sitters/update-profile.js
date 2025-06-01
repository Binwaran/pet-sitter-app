import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// สร้างฟังก์ชันสำหรับจัดการ error เพื่อลดโค้ดซ้ำซ้อน
const handleError = (error, res, message = "Server error") => {
  console.error(`Error: ${message}`, error);
  return res.status(500).json({ error: error.message || message });
};

// ตรวจสอบ token
const validateAuth = (req) => {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.startsWith("Bearer ");
};

// แปลง pending data
function preparePendingData(data) {
  const {
    full_name,
    email,
    phone_number,
    profile_image_url,
    experience,
    introduction,
    trade_name,
    pet_types,
    services,
    place_description,
    my_place,
    province,
    district,
    sub_district,
    house_number,
    village,
    post_code,
    gallery_image_url,
    gallery,
    ...otherData
  } = data;

  // จัดการกับ gallery images
  const galleryImages = Array.isArray(gallery_image_url || gallery)
    ? (gallery_image_url || gallery).filter((url) => typeof url === "string")
    : [];

  return {
    // ข้อมูลส่วนตัว
    profile_info: {
      full_name,
      email,
      phone_number,
      profile_image_url:
        typeof profile_image_url === "string" ? profile_image_url : null,
    },
    // ข้อมูลอาชีพ
    experience,
    introduction,
    // ข้อมูลธุรกิจ
    trade_name,
    // ข้อมูลบริการ
    pet_type: pet_types,
    services,
    my_place: place_description || my_place,
    // ข้อมูลสถานที่
    province: typeof province === "object" ? province.label : province,
    district: typeof district === "object" ? district.label : district,
    sub_district:
      typeof sub_district === "object" ? sub_district.label : sub_district,
    house_number,
    village,
    post_code,
    // รูปภาพแกลเลอรี่
    gallery_image_url: galleryImages,
    // ข้อมูลอื่นๆ
    ...otherData,
    // เวลาที่ส่งข้อมูล
    updated_at: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  // ตรวจสอบ authorization
  if (!validateAuth(req)) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Invalid token format" });
  }

  // GET method - สำหรับดึงข้อมูลโปรไฟล์
  if (req.method === "GET") {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const userIdString = String(user_id);

      // ดึงข้อมูลจาก pet_sitter table
      const { data: petSitterData, error: petSitterError } = await supabase
        .from("pet_sitter")
        .select("*")
        .eq("user_id", userIdString)
        .single();

      if (petSitterError && petSitterError.code !== "PGRST116") {
        return handleError(
          petSitterError,
          res,
          "Error fetching pet sitter data"
        );
      }

      // ดึงข้อมูลจาก users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, phone, profile_image_url")
        .eq("id", userIdString)
        .single();

      if (userError) {
        return handleError(userError, res, "Error fetching user data");
      }

      // รวมข้อมูล user กับ pet sitter และส่งกลับ
      return res.status(200).json({
        data: {
          ...petSitterData,
          full_name: userData.name,
          email: userData.email,
          phone_number: userData.phone,
          profile_image_url: userData.profile_image_url,
        },
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // POST method - สำหรับอัพเดทข้อมูลโปรไฟล์
  else if (req.method === "POST") {
    const {
      user_id,
      // ข้อมูลส่วนตัว
      full_name,
      email,
      phone_number,
      profile_image_url,
      // ข้อมูล pet sitter
      experience,
      introduction,
      trade_name,
      pet_types,
      services,
      place_description,
      my_place,
      province,
      district,
      sub_district,
      house_number,
      village,
      post_code,
      gallery_image_url,
      gallery,
      ...otherData
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const userIdString = String(user_id);

      // 1. อัพเดทข้อมูลพื้นฐานในตาราง users
      const { error: userError } = await supabase
        .from("users")
        .update({
          name: full_name,
          email: email,
          phone: phone_number,
          profile_image_url: profile_image_url,
        })
        .eq("id", userIdString);

      if (userError) {
        return handleError(userError, res, "Error updating user data");
      }

      // 2. เตรียมข้อมูลที่รอการอนุมัติ
      const pendingData = preparePendingData({
        full_name,
        email,
        phone_number,
        profile_image_url,
        experience,
        introduction,
        trade_name,
        pet_types,
        services,
        place_description,
        my_place,
        province,
        district,
        sub_district,
        house_number,
        village,
        post_code,
        gallery_image_url,
        gallery,
        ...otherData,
      });

      // 3. ตรวจสอบว่ามีข้อมูล pet_sitter อยู่แล้วหรือไม่
      const { data: existingData, error: checkError } = await supabase
        .from("pet_sitter")
        .select("user_id, status")
        .eq("user_id", userIdString)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        return handleError(
          checkError,
          res,
          "Error checking existing pet sitter data"
        );
      }

      // 4. อัพเดทหรือสร้างข้อมูลใน pet_sitter
      const petSitterData = {
        status: "waiting for approval",
        admin_suggestion: null,
        pending_data: pendingData,
      };

      let petSitterResult;

      // Update หรือ Insert ขึ้นอยู่กับว่ามีข้อมูลอยู่แล้วหรือไม่
      if (existingData) {
        const { data, error } = await supabase
          .from("pet_sitter")
          .update(petSitterData)
          .eq("user_id", userIdString)
          .select();

        if (error) {
          return handleError(error, res, "Error updating pet sitter data");
        }

        petSitterResult = data;
      } else {
        const { data, error } = await supabase
          .from("pet_sitter")
          .insert({
            user_id: userIdString,
            ...petSitterData,
          })
          .select();

        if (error) {
          return handleError(error, res, "Error creating pet sitter data");
        }

        petSitterResult = data;
      }

      // 5. ส่งผลลัพธ์กลับไปที่ client
      return res.status(200).json({
        success: true,
        message: "Profile submitted and waiting for admin approval",
        data: petSitterResult?.[0] || null,
      });
    } catch (error) {
      return handleError(error, res, "Error updating profile");
    }
  }

  // สำหรับ method อื่นๆที่ไม่รองรับ
  else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
