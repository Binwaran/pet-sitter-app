import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { sitterId } = req.query;

    try {
      console.log("Fetching bookings for sitter ID:", sitterId);

      // 1. ดึงข้อมูล bookings ตาม sitter_id
      const { data: bookings, error } = await supabase
        .from("booking")
        .select("*")
        .eq("sitter_id", sitterId)
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }

      // ถ้าไม่มีข้อมูล
      if (!bookings || bookings.length === 0) {
        return res.status(200).json({ data: [] });
      }

      // 2. ดึงข้อมูล booking_pets สำหรับทุก booking
      const bookingIds = bookings.map((booking) => booking.booking_id);
      const { data: bookingPets, error: bookingPetsError } = await supabase
        .from("booking_pets")
        .select("*")
        .in("booking_id", bookingIds);

      if (bookingPetsError) {
        console.error("Error fetching booking pets:", bookingPetsError);
      }

      // จัดกลุ่ม pet_ids ตาม booking_id
      const bookingPetsMap = {};
      if (bookingPets) {
        bookingPets.forEach((item) => {
          if (!bookingPetsMap[item.booking_id]) {
            bookingPetsMap[item.booking_id] = [];
          }
          bookingPetsMap[item.booking_id].push(item.pet_id);
        });
      }

      // 3. รวบรวม owner_ids และ pet_ids
      const ownerIds = [
        ...new Set(bookings.map((booking) => booking.owner_id)),
      ];

      // รวบรวม pet_ids จาก booking_pets
      const allPetIds = bookingPets
        ? bookingPets.map((item) => item.pet_id)
        : [];
      // เพิ่ม pet_id จาก booking ด้วย (สำหรับข้อมูลเก่า)
      bookings.forEach((booking) => {
        if (booking.pet_id) allPetIds.push(booking.pet_id);
      });
      const petIds = [...new Set(allPetIds.filter(Boolean))];

      // 4. ดึงข้อมูล users (owners)
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, profile_image_url")
        .in("id", ownerIds)
        .eq("role", "owner");

      if (usersError) {
        console.error("Error fetching users:", usersError);
      }

      // สร้าง map ของ users
      const usersMap = {};
      if (users) {
        users.forEach((user) => {
          usersMap[user.id] = user;
        });
      }

      // 5. ดึงข้อมูล pets
      const { data: pets, error: petsError } = await supabase
        .from("pets")
        .select("pet_id, pet_name, pet_image_url, owner_id, pet_type")
        .in("pet_id", petIds);

      if (petsError) {
        console.error("Error fetching pets:", petsError);
      }

      // สร้าง map ของ pets
      const petsMap = {};
      if (pets) {
        pets.forEach((pet) => {
          petsMap[pet.pet_id] = pet;
        });
      }

      // 6. จัดรูปแบบข้อมูล bookings
      const formattedBookings = bookings.map((booking) => {
        try {
          // หาข้อมูล owner
          const user = usersMap[booking.owner_id] || null;

          // หา pet_ids สำหรับ booking นี้
          const bookingPetIds = bookingPetsMap[booking.booking_id] || [];
          // เพิ่ม pet_id จาก booking ด้วย (สำหรับข้อมูลเก่า)
          if (booking.pet_id && !bookingPetIds.includes(booking.pet_id)) {
            bookingPetIds.push(booking.pet_id);
          }

          // หาข้อมูล pets ทั้งหมดของ booking นี้
          // กรองเฉพาะสัตว์เลี้ยงที่เป็นของเจ้าของตามการจองนั้น
          const bookingPetsData = bookingPetIds
            .map((petId) => petsMap[petId])
            .filter((pet) => pet && pet.owner_id === booking.owner_id);

          // จัดการกับวันที่และเวลา
          let durationHours = 0;
          let bookedDate = "N/A";

          if (booking.start_time && booking.end_time) {
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);

            if (!isNaN(start) && !isNaN(end)) {
              durationHours = Math.round((end - start) / (1000 * 60 * 60));

              // ฟอร์แมตวันที่และเวลาตาม Figma
              const startDay = start.getDate();
              const startMonth = start.toLocaleString("en-US", {
                month: "short",
              });
              const startHour = start.getHours();
              const startAmPm = startHour >= 12 ? "PM" : "AM";
              const startHour12 = startHour % 12 || 12;

              const endDay = end.getDate();
              const endMonth = end.toLocaleString("en-US", { month: "short" });
              const endHour = end.getHours();
              const endAmPm = endHour >= 12 ? "PM" : "AM";
              const endHour12 = endHour % 12 || 12;

              // ถ้าวันเดียวกัน แสดงแค่วันเดียว
              if (start.toDateString() === end.toDateString()) {
                bookedDate = `${startDay} ${startMonth}, ${startHour12} ${startAmPm} - ${endHour12} ${endAmPm}`;
              } else {
                // ถ้าข้ามวัน แสดงทั้งสองวัน
                bookedDate = `${startDay} ${startMonth}, ${startHour12} ${startAmPm} - ${endDay} ${endMonth}, ${endHour12} ${endAmPm}`;
              }
            }
          }

          // จัดเตรียมข้อมูล pets สำหรับ response - เพิ่ม pet_type
          const formattedPets = bookingPetsData.map((p) => ({
            id: p.pet_id || "unknown",
            name: p.pet_name || "Unknown Pet",
            image: p.pet_image_url || null,
            type: p.pet_type || "Pet", // เพิ่ม pet_type เพื่อแสดงประเภทสัตว์เลี้ยง
          }));

          return {
            id: booking.booking_id || "unknown",
            owner_name: user?.name || "Unknown",
            owner_image: user?.profile_image_url || null,
            booked_date: bookedDate,
            duration: durationHours,
            pet_count: bookingPetsData.length, // ปรับให้นับเฉพาะสัตว์เลี้ยงที่ตรงกับเจ้าของ
            pets: formattedPets,
            status: booking.status || "unknown",
            message: booking.message || "",
            total_price: booking.total_price || 0,
            transaction_no: booking.transaction_no || "",
          };
        } catch (formatError) {
          console.error("Error formatting booking:", formatError);
          return {
            id: booking.booking_id || "error",
            owner_name: "Error processing booking",
            owner_image: null,
            booked_date: "N/A",
            duration: 0,
            pet_count: 0,
            pets: [],
            status: "unknown",
          };
        }
      });

      console.log(
        `Successfully processed ${formattedBookings.length} bookings`
      );
      return res.status(200).json({ data: formattedBookings });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return res
        .status(500)
        .json({ error: error.message || "Failed to fetch bookings" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
