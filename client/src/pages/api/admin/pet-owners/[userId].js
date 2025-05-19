import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method === "GET") {
    try {
      console.log("🔍 Fetching pet owner with ID:", userId);

      // ดึงข้อมูล pet owner
      const { data: ownerData, error: ownerError } = await supabase
        .from("users")
        .select(
          `
          id,
          name,
          email,
          phone,
          profile_image_url,
          created_at,
          updated_at,
          status,
          birthday,
          role
        `
        )
        .eq("id", userId)
        .eq("role", "owner")
        .single();

      if (ownerError) {
        console.error("❌ Owner query error:", ownerError);
        return res.status(404).json({
          success: false,
          message: "Pet owner not found",
          error: ownerError.message,
        });
      }

      if (!ownerData) {
        return res.status(404).json({
          success: false,
          message: "Pet owner not found",
        });
      }

      console.log("✅ Found owner:", ownerData.name);

      // ดึงข้อมูลสัตว์เลี้ยงของ owner (แก้ไขตาม database schema)
      const { data: petsData, error: petsError } = await supabase
        .from("pets")
        .select(
          `
          pet_id,
          pet_name,
          pet_type,
          breed,
          sex,
          age,
          color,
          weight,
          about,
          pet_image_url,
          created_at
        `
        )
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (petsError) {
        console.error("❌ Pets query error:", petsError);
      }

      // แปลงข้อมูลสัตว์เลี้ยงให้ตรงกับ format ที่ frontend ต้องการ
      const formattedPets = (petsData || []).map((pet) => ({
        id: pet.pet_id,
        name: pet.pet_name,
        species: pet.pet_type, // แปลง pet_type เป็น species
        breed: pet.breed,
        sex: pet.sex,
        age: pet.age,
        color: pet.color,
        weight: pet.weight,
        about: pet.about,
        profile_image_url: pet.pet_image_url, // แปลง pet_image_url เป็น profile_image_url
        created_at: pet.created_at,
      }));

      const responseData = {
        owner: {
          ...ownerData,
          status: ownerData.status || "normal",
          date_of_birth: ownerData.birthday,
          address: ownerData.address || null,
        },
        pets: formattedPets, // ใช้ข้อมูลที่แปลงแล้ว
        stats: {
          total_pets: formattedPets.length,
        },
      };

      console.log("📦 Sending response:", {
        owner: responseData.owner.name,
        pets: responseData.pets.length,
        stats: responseData.stats,
      });

      return res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error("💥 API Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // PUT - อัพเดต status ของ pet owner
  else if (req.method === "PUT") {
    try {
      const { status, ...updateData } = req.body;

      const { data, error } = await supabase
        .from("users")
        .update({
          ...updateData,
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .eq("role", "owner")
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to update pet owner",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Pet owner updated successfully",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
