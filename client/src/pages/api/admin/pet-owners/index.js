import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("🔍 Starting to fetch pet owners...");
    
    // ดึงข้อมูล users ที่เป็น pet_owner (ไม่มี role แยก แต่ดูจาก pets table)
    const { data: ownersData, error: ownersError } = await supabase
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
        status
      `
      )
      .order("updated_at", { ascending: false });

    console.log("📊 Total users from database:", ownersData?.length || 0);
    console.log("👥 First 3 users:", ownersData?.slice(0, 3));
    
    if (ownersError) {
      console.error("❌ Database error:", ownersError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pet owners",
        error: ownersError.message,
      });
    }

    console.log("🔄 Processing users to find pet owners...");
    
    // กรองเฉพาะคนที่มีสัตว์เลี้ยง (pet owners) และนับจำนวนสัตว์เลี้ยง
    const ownersWithPetCount = await Promise.all(
      ownersData.map(async (user, index) => {
        console.log(`🐾 Checking pets for user ${index + 1}/${ownersData.length}: ${user.name} (ID: ${user.id})`);
        
        const { count: petCount, error: petError } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id);

        console.log(`   Pet count for ${user.name}: ${petCount}, Error:`, petError?.message || "none");

        // ถ้ามีสัตว์เลี้ยงถึงจะเป็น pet owner
        if (!petError && petCount > 0) {
          console.log(`   ✅ ${user.name} is a pet owner with ${petCount} pets`);
          return {
            ...user,
            pet_count: petCount,
            status: user.status || "normal",
          };
        }
        console.log(`   ❌ ${user.name} is not a pet owner (no pets)`);
        return null;
      })
    );

    // กรองเอาเฉพาะที่ไม่ใช่ null (มีสัตว์เลี้ยง)
    const petOwners = ownersWithPetCount.filter((owner) => owner !== null);
    
    console.log("🎯 Final pet owners found:", petOwners.length);
    console.log("📋 Pet owners list:", petOwners.map(owner => ({
      name: owner.name,
      email: owner.email,
      pet_count: owner.pet_count,
      status: owner.status
    })));

    return res.status(200).json({
      success: true,
      data: petOwners,
      total: petOwners.length,
    });
  } catch (error) {
    console.error("💥 Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
