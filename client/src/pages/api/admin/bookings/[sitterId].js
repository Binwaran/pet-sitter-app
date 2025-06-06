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
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }

      // ถ้าไม่มีข้อมูล
      if (!bookings || bookings.length === 0) {
        return res.status(200).json({ data: [] });
      }

      // 2. รวบรวม booking_ids และ owner_ids
      const bookingIds = bookings.map((booking) => booking.booking_id);
      const ownerIds = [
        ...new Set(bookings.map((booking) => booking.owner_id)),
      ];

      // 3. ดึงข้อมูล booking_pets สำหรับทุก booking
      const { data: bookingPets, error: bookingPetsError } = await supabase
        .from("booking_pets")
        .select("*")
        .in("booking_id", bookingIds);

      if (bookingPetsError) {
        console.error("Error fetching booking pets:", bookingPetsError);
      }

      // 4. จัดกลุ่ม pet_ids ตาม booking_id
      const bookingPetsMap = {};
      if (bookingPets) {
        bookingPets.forEach((item) => {
          if (!bookingPetsMap[item.booking_id]) {
            bookingPetsMap[item.booking_id] = [];
          }
          bookingPetsMap[item.booking_id].push(item.pet_id);
        });
      }

      // 5. รวบรวม pet_ids จากทุกแหล่ง
      let allPetIds = [];

      // เพิ่ม pet_id จาก booking
      bookings.forEach((booking) => {
        if (booking.pet_id) allPetIds.push(booking.pet_id);
      });

      // เพิ่ม pet_id จาก booking_pets
      if (bookingPets) {
        bookingPets.forEach((item) => {
          if (item.pet_id) allPetIds.push(item.pet_id);
        });
      }

      // กำจัดค่าซ้ำและกรองเอาแค่ค่าที่ไม่เป็น null/undefined
      const petIds = [...new Set(allPetIds.filter(Boolean))];

      // 6. ดึงข้อมูล users (owners)
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

      // 7. ดึงข้อมูล pets ทั้งหมดที่เกี่ยวข้อง
      const { data: relatedPets, error: petsError } = await supabase
        .from("pets")
        .select("pet_id, pet_name, pet_image_url, owner_id, pet_type")
        .in("pet_id", petIds);

      if (petsError) {
        console.error("Error fetching pets:", petsError);
      }

      // สร้าง map ของ pets ตาม pet_id
      const petsMap = {};
      if (relatedPets) {
        relatedPets.forEach((pet) => {
          petsMap[pet.pet_id] = pet;
        });
      }

      // 8. ดึงสัตว์เลี้ยงทั้งหมดของเจ้าของ (สำหรับกรณีไม่พบสัตว์เลี้ยงในการจอง)
      const { data: allOwnerPets, error: ownerPetsError } = await supabase
        .from("pets")
        .select("pet_id, pet_name, pet_image_url, owner_id, pet_type")
        .in("owner_id", ownerIds);

      if (ownerPetsError) {
        console.error("Error fetching all owner pets:", ownerPetsError);
      }

      // จัดกลุ่มสัตว์เลี้ยงตามเจ้าของ
      const petsByOwner = {};
      if (allOwnerPets) {
        allOwnerPets.forEach((pet) => {
          if (!petsByOwner[pet.owner_id]) {
            petsByOwner[pet.owner_id] = [];
          }
          petsByOwner[pet.owner_id].push(pet);
        });
      }

      // 9. จัดรูปแบบข้อมูล bookings
      const formattedBookings = bookings.map((booking) => {
        try {
          // หาข้อมูล owner
          const user = usersMap[booking.owner_id] || null;

          // รวบรวม pet_ids สำหรับ booking นี้
          let bookingPetIds = [];

          // เพิ่ม pet_id จาก booking (ถ้ามี)
          if (booking.pet_id) {
            bookingPetIds.push(booking.pet_id);
          }

          // เพิ่ม pet_ids จาก booking_pets
          if (bookingPetsMap[booking.booking_id]) {
            bookingPetIds = [
              ...new Set([
                ...bookingPetIds,
                ...bookingPetsMap[booking.booking_id],
              ]),
            ];
          }

          // หาข้อมูล pets จาก bookingPetIds
          let bookingPetsData = bookingPetIds
            .map((petId) => petsMap[petId])
            .filter(Boolean);

          // กรองเฉพาะสัตว์เลี้ยงที่เป็นของเจ้าของ หรืออยู่ใน bookingPetIds
          bookingPetsData = bookingPetsData.filter((pet) => {
            return (
              pet &&
              (pet.owner_id === booking.owner_id ||
                bookingPetIds.includes(pet.pet_id))
            );
          });

          // *** ปรับปรุงตาม [id].js ***
          // กรณีไม่พบข้อมูลสัตว์เลี้ยง หรือมี pet_id เป็น null ให้ดึงสัตว์เลี้ยงทั้งหมดของเจ้าของ
          if (bookingPetsData.length === 0 || booking.pet_id === null) {
            console.log(
              `No pets found for booking ${booking.booking_id}, using owner's pets`
            );
            const ownerPets = petsByOwner[booking.owner_id] || [];
            if (ownerPets.length > 0) {
              bookingPetsData = ownerPets;
            }
          }

          // จัดการกับวันที่และเวลา (คงรูปแบบเดิมตามที่ต้องการ)
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

          // จัดเตรียมข้อมูล pets สำหรับ response
          const formattedPets = bookingPetsData.map((p) => ({
            id: p.pet_id || "unknown",
            name: p.pet_name || "Unknown Pet",
            image: p.pet_image_url || null,
            type: p.pet_type || "Pet",
          }));

          return {
            id: booking.booking_id || "unknown",
            owner_name: user?.name || "Unknown",
            owner_image: user?.profile_image_url || null,
            booked_date: bookedDate,
            duration: durationHours,
            pet_count: formattedPets.length, // ปรับตามจำนวนสัตว์เลี้ยงที่มี
            pets:
              formattedPets.length > 0
                ? formattedPets
                : [
                    {
                      id: "unknown",
                      name: "No Pets",
                      type: "N/A",
                      image: null,
                    },
                  ],
            status: booking.status || "unknown",
            message: booking.message || "",
            total_price: booking.total_price || 0,
            transaction_no: booking.transaction_no || "",
            start_time: booking.start_time, // เพิ่มเพื่อใช้ในการ sort
            end_time: booking.end_time, // เพิ่มเพื่อใช้ในการ sort
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
            pets: [{ id: "unknown", name: "Error", type: "N/A", image: null }],
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
