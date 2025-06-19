import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    // 1. ดึง booking เฉพาะของ owner คนนี้
    const { data: bookings, error } = await supabase
      .from("booking")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 2. รวม sitter_id และ pet_id ทั้งหมด
    const sitterIds = [
      ...new Set(bookings.map(b => b.sitter_id).filter(Boolean))
    ];
    const petIds = [
      ...new Set(bookings.map(b => b.pet_id).filter(Boolean))
    ];

    // 3. ดึงข้อมูล sitter จาก table pet_sitter ทีเดียว
    let sitters = [];
    if (sitterIds.length > 0) {
      const { data: sittersData } = await supabase
        .from("pet_sitter")
        .select("user_id, trade_name")
        .in("user_id", sitterIds);
      sitters = sittersData || [];
    }
    const sitterMap = {};
    sitters.forEach(sitter => {
      sitterMap[sitter.user_id] = sitter;
    });

    // 4. ดึงข้อมูล users ทีเดียว (เพื่อ profile_image_url)
    let users = [];
    if (sitterIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, profile_image_url")
        .in("id", sitterIds);
      users = usersData || [];
    }
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });

    // 5. ดึงข้อมูล pet ทีเดียว
    let pets = [];
    if (petIds.length > 0) {
      const { data: petsData } = await supabase
        .from("pets")
        .select("pet_id, pet_name, pet_type, pet_image_url")
        .in("pet_id", petIds);
      pets = petsData || [];
    }
    const petMap = {};
    pets.forEach(pet => {
      petMap[pet.pet_id] = {
        pet_id: pet.pet_id,
        name: pet.pet_name || "-",
        type: pet.pet_type || "",
        image_url: pet.pet_image_url || ""
      };
    });

    // 6. map ข้อมูล sitter + users + pets กลับเข้า booking
    const bookingsWithDetails = bookings.map(booking => {
      // sitter
      const sitter = sitterMap[booking.sitter_id] || {};
      const user = userMap[booking.sitter_id] || {};
      // ใช้ profile_image_url จาก pet_sitter ถ้ามี, ถ้าไม่มีใช้จาก users, ถ้าไม่มีอีกใช้ default
      const profileImage =
        sitter.profile_image_url ||
        user.profile_image_url ||
        "/assets/pet-sitter.jpg";
      // pets
      let petsArr = [];
      if (booking.pet_id) {
        petsArr = [petMap[booking.pet_id] || { pet_id: booking.pet_id, name: "-" }];
      }
      return {
        ...booking,
        sitter_trade_name: sitter.trade_name || "-",
        sitter_profile_image: profileImage,
        pets: petsArr
      };
    });

    return res.status(200).json({ data: bookingsWithDetails });
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}