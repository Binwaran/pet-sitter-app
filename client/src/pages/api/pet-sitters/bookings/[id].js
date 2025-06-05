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
      console.error("JWT verification error:", jwtError);
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
        sitter_id
      `
      )
      .eq("booking_id", id)
      .eq("sitter_id", userId)
      .single();

    if (bookingError) {
      console.error("Booking fetch error:", bookingError);
      return res.status(500).json({ message: "Failed to fetch booking" });
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // แก้ไขส่วนที่เกี่ยวกับข้อมูลสัตว์เลี้ยง
    console.log("Booking ID:", booking.booking_id);
    console.log("Owner ID:", booking.owner_id);

    // ดึงข้อมูลสัตว์เลี้ยงที่เกี่ยวข้องกับการจองนี้
    const { data: bookingPets, error: petsError } = await supabase
      .from("booking_pets")
      .select("*")
      .eq("booking_id", booking.booking_id);

    console.log("Booking pets result:", bookingPets);

    if (petsError) {
      console.error("Booking pets error:", petsError);
    }

    // เพิ่มส่วนนี้เพื่อจัดการข้อมูลสัตว์เลี้ยง
    let pets = [];
    let bookingPetIds = [];

    // 1. รวบรวม pet_id จาก booking_pets
    if (bookingPets?.length > 0) {
      bookingPetIds = bookingPets.map((bp) => bp.pet_id);
    }

    // 2. เพิ่ม pet_id จาก booking (สำหรับข้อมูลเก่า)
    if (booking.pet_id && !bookingPetIds.includes(booking.pet_id)) {
      bookingPetIds.push(booking.pet_id);
    }

    console.log("Pet IDs to fetch:", bookingPetIds);

    // 3. ดึงข้อมูลสัตว์เลี้ยงทั้งหมด
    if (bookingPetIds.length > 0) {
      const { data: petsData, error: petDetailsError } = await supabase
        .from("pets")
        .select("pet_id, pet_name, pet_type, pet_image_url, owner_id")
        .in("pet_id", bookingPetIds);

      console.log("Pets data result:", petsData);

      if (petDetailsError) {
        console.error("Pet details error:", petDetailsError);
      } else if (petsData) {
        // 4. กรองเฉพาะสัตว์เลี้ยงที่เป็นของเจ้าของตามการจองนั้น
        const filteredPets = petsData.filter(
          (pet) => pet && pet.owner_id === booking.owner_id
        );

        console.log("Filtered pets:", filteredPets);

        // 5. ปรับโครงสร้างข้อมูลให้ตรงกับฟิลด์ในตาราง pets
        pets = filteredPets.map((pet) => ({
          id: pet.pet_id,
          name: pet.pet_name,
          type: pet.pet_type,
          image: pet.pet_image_url,
        }));

        console.log("Formatted pets:", pets);
      }
    }

    // 6. ถ้ายังไม่มีข้อมูลสัตว์เลี้ยง ลองดึงข้อมูลสัตว์เลี้ยงของเจ้าของโดยตรง
    if (pets.length === 0 && booking.owner_id) {
      const { data: ownerPets, error: ownerPetsError } = await supabase
        .from("pets")
        .select("pet_id, pet_name, pet_type, pet_image_url")
        .eq("owner_id", booking.owner_id);

      console.log("Owner pets directly:", ownerPets);

      if (!ownerPetsError && ownerPets?.length > 0) {
        pets = ownerPets.map((pet) => ({
          id: pet.pet_id,
          name: pet.pet_name,
          type: pet.pet_type,
          image: pet.pet_image_url,
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
        .select("id, name, profile_image_url")
        .eq("id", booking.owner_id)
        .single();

      if (ownerError) {
        console.error("Error fetching owner:", ownerError);
      } else if (ownerData) {
        owner = ownerData;
        console.log("Owner data:", ownerData);
      }
    }

    // จากนั้นใช้ตัวแปร owner ในการสร้าง formattedBooking
    const formattedBooking = {
      id: booking.booking_id,
      owner_name: owner?.name || "Unknown",
      owner_image: owner?.profile_image_url || null,
      status: booking.status,
      pets:
        pets.length > 0
          ? pets
          : [{ id: "unknown", name: "No Pets", type: "N/A", image: null }],
      pet_count: pets.length,
      duration: duration,
      booked_date: bookingDate,
      message: "",
      total_price: booking.total_price || 0,
      transaction_date: booking.transaction_date
        ? new Date(booking.transaction_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      transaction_no: booking.transaction_no || "",
    };

    return res.status(200).json({ data: formattedBooking });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
