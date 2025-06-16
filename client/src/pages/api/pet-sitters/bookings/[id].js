import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Missing booking id" });
  }

  try {
    // เปลี่ยนจากการตรวจสอบ Authorization header เป็นการตรวจสอบ cookie
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Use JWT verification instead of Supabase auth
    let userData;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.user_id || decoded.sub;

      if (!userId) {
        return res.status(401).json({ message: "Invalid user ID in token" });
      }

      userData = { user: { id: userId } };
    } catch (jwtError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = userData.user.id;

    // ดึงข้อมูล booking จาก ID และตรวจสอบว่าเป็นของ pet sitter คนนี้จริงไหม
    const { data: booking, error: bookingError } = await supabase
      .from("booking")
      .select(
        `
    booking_id,
    status,
    message,
    start_time,
    end_time,
    total_price,
    transaction_no,
    transaction_date,
    owner_id,
    sitter_id,
    pet_id
    `
      )
      .eq("booking_id", id)
      .eq("sitter_id", userId)
      .single();

    if (bookingError) {
      return res.status(500).json({ message: "Failed to fetch booking" });
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 1. หา pet_ids จาก booking.pet_id และ booking_pets
    let bookingPetIds = [];

    // เพิ่ม pet_id จาก booking table (ถ้ามี)
    if (booking.pet_id) {
      bookingPetIds.push(booking.pet_id);
    }

    // ดึงข้อมูลจาก booking_pets table
    const { data: bookingPets, error: bookingPetsError } = await supabase
      .from("booking_pets")
      .select("*")
      .eq("booking_id", booking.booking_id);

    if (bookingPetsError) {
    } else if (bookingPets?.length > 0) {
      const additionalPetIds = bookingPets.map((bp) => bp.pet_id);
      // รวม pet IDs และกำจัดค่าซ้ำ
      bookingPetIds = [
        ...new Set([...bookingPetIds, ...additionalPetIds.filter(Boolean)]),
      ];
    }

    // 2. ดึงข้อมูลของสัตว์เลี้ยงทั้งหมดที่เกี่ยวข้อง
    let pets = [];
    let petsData = [];
    let bookingPetsData = [];

    if (bookingPetIds.length > 0) {
      const { data: fetchedPetsData, error: petsError } = await supabase
        .from("pets")
        .select("*") // ดึงข้อมูลทั้งหมด แทนที่จะระบุเฉพาะฟิลด์
        .in("pet_id", bookingPetIds);

      petsData = fetchedPetsData || [];

      if (petsError) {
      } else {
        // 3. กรองเฉพาะสัตว์เลี้ยงที่เป็นของเจ้าของตามการจองนั้น - ลดความเข้มงวด
        bookingPetsData = petsData.filter((pet) => {
          // ตรวจสอบว่ามีข้อมูลและเป็นของเจ้าของ หรืออยู่ในรายการ bookingPetIds
          return (
            pet &&
            (pet.owner_id === booking.owner_id ||
              bookingPetIds.includes(pet.pet_id))
          );
        });

        // 4. จัดรูปแบบข้อมูลสัตว์เลี้ยง - แก้ไขส่วนนี้ให้มีข้อมูลครบ
        pets = bookingPetsData.map((p) => ({
          id: p.pet_id || "unknown",
          name: p.pet_name || "Unknown Pet",
          type: p.pet_type || "Pet",
          breed: p.breed || null,
          sex: p.sex || null,
          age: p.age || null,
          color: p.color || null,
          weight: p.weight || null,
          about: p.about || null,
          image: p.pet_image_url || null,
        }));
      }
    }

    // กรณีไม่พบข้อมูลสัตว์เลี้ยง หรือถ้ามี pet_id เป็น null ให้ดึงทั้งหมดของเจ้าของ
    if (pets.length === 0 || booking.pet_id === null) {
      // ดึงสัตว์เลี้ยงทั้งหมดของเจ้าของคนนี้
      const { data: ownerPets, error: ownerPetsError } = await supabase
        .from("pets")
        .select("*") // เปลี่ยนเป็นดึงข้อมูลทั้งหมด
        .eq("owner_id", booking.owner_id)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (ownerPetsError) {
      } else if (ownerPets && ownerPets.length > 0) {
        // จัดรูปแบบข้อมูลสัตว์เลี้ยงเหมือนกับด้านบน
        pets = ownerPets.map((p) => ({
          id: p.pet_id || "unknown",
          name: p.pet_name || "Unknown Pet",
          type: p.pet_type || "Pet",
          breed: p.breed || null,
          sex: p.sex || null,
          age: p.age || null,
          color: p.color || null,
          weight: p.weight || null,
          about: p.about || null,
          image: p.pet_image_url || null,
        }));
      }
    }

    // คำนวณระยะเวลา (duration) จาก start_time และ end_time
    let duration = 0;
    if (booking.start_time && booking.end_time) {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      duration = Math.round((end - start) / (1000 * 60 * 60)); // จำนวนชั่วโมง
    }

    // จัดรูปแบบของ booking date
    const bookingDate = booking.start_time
      ? new Date(booking.start_time).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        " | " +
        new Date(booking.start_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        }) +
        " - " +
        new Date(booking.end_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        })
      : "N/A";

    let owner = null;
    if (booking.owner_id) {
      const { data: ownerData, error: ownerError } = await supabase
        .from("users")
        .select("id, name, email, phone, birthday, profile_image_url") // เพิ่ม email, phone, birthday
        .eq("id", booking.owner_id)
        .single();

      if (ownerError) {
        // จัดการข้อผิดพลาดโดยไม่ใช้ console.error
      } else if (ownerData) {
        owner = ownerData;
      }
    }

    // จากนั้นใช้ตัวแปร owner ในการสร้าง formattedBooking
    const formattedBooking = {
      id: booking.booking_id,
      owner_name: owner?.name || "Unknown",
      owner_image: owner?.profile_image_url || null,
      owner_email: owner?.email || "", // เพิ่มฟิลด์นี้
      owner_phone: owner?.phone || "", // เพิ่มฟิลด์นี้
      owner_birthday: owner?.birthday || "", // เพิ่มฟิลด์นี้
      status: booking.status,
      pets:
        pets.length > 0
          ? pets
          : [{ id: "unknown", name: "No Pets", type: "N/A", image: null }],
      pet_count: pets.length,
      duration: duration,
      booked_date: bookingDate,
      message: booking.message || "",
      total_price: booking.total_price || 0,
      transaction_date: booking.transaction_date
        ? new Date(booking.transaction_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      transaction_no: booking.transaction_no || "",
      start_time: booking.start_time, // เพิ่มเพื่อใช้ในการ sort
      end_time: booking.end_time, // เพิ่มเพื่อใช้ในการ sort
    };

    return res.status(200).json({
      data: formattedBooking,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
