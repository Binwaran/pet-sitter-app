import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid token format" });
  }

  try {
    // Get token and decode it
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    console.log("Fetching bookings for sitter ID:", userId);

    // 1. Get bookings for this sitter
    const { data: bookings, error } = await supabase
      .from("booking")
      .select("*")
      .eq("sitter_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // 2. Get booking pets relationships
    const bookingIds = bookings.map((booking) => booking.booking_id);
    console.log("Booking IDs:", bookingIds); // Debug log

    const { data: bookingPets, error: bookingPetsError } = await supabase
      .from("booking_pets")
      .select("*")
      .in("booking_id", bookingIds);

    if (bookingPetsError) {
      console.error("Error fetching booking pets:", bookingPetsError);
      return res.status(500).json({ error: "Failed to fetch booking pets" });
    }

    console.log("Retrieved booking_pets:", bookingPets); // Debug log

    // Map booking pets by booking_id
    const bookingPetsMap = {};
    if (bookingPets && bookingPets.length > 0) {
      bookingPets.forEach((item) => {
        if (!bookingPetsMap[item.booking_id]) {
          bookingPetsMap[item.booking_id] = [];
        }
        bookingPetsMap[item.booking_id].push(item.pet_id);
      });
    } else {
      console.log("No booking_pets records found");
    }

    console.log("Booking pets map:", bookingPetsMap); // Debug log

    // Gather all pet IDs
    const allPetIds = bookingPets ? bookingPets.map((item) => item.pet_id) : [];
    // Include pet_id from booking table for legacy data
    bookings.forEach((booking) => {
      if (booking.pet_id) allPetIds.push(booking.pet_id);
    });
    const petIds = [...new Set(allPetIds.filter(Boolean))];

    // 3. Get owner information
    const ownerIds = [...new Set(bookings.map((booking) => booking.owner_id))];
    const { data: owners } = await supabase
      .from("users")
      .select("id, name, profile_image_url")
      .in("id", ownerIds);

    // Map owners by ID
    const ownersMap = {};
    if (owners) {
      owners.forEach((owner) => {
        ownersMap[owner.id] = owner;
      });
    }

    // 4. Get pet information if we have pet IDs
    const { data: pets, error: petsError } = await supabase
      .from("pets")
      .select("pet_id, pet_name, pet_image_url, owner_id, pet_type")
      .in("pet_id", petIds);

    if (petsError) {
      console.error("Error fetching pets:", petsError);
    }

    // Map pets by ID
    const petsMap = {};
    if (pets) {
      pets.forEach((pet) => {
        petsMap[pet.pet_id] = pet;
      });
    }

    // 5. Format bookings data
    const formattedBookings = bookings.map((booking) => {
      try {
        const owner = ownersMap[booking.owner_id] || null;

        // Get pet IDs for this booking
        const bookingPetIds = bookingPetsMap[booking.booking_id] || [];

        // Check if booking has a pet_id field (legacy data)
        if (booking.pet_id && !bookingPetIds.includes(booking.pet_id)) {
          bookingPetIds.push(booking.pet_id);
        }

        // Get pet data for this booking - less restrictive filtering
        const bookingPetsData = bookingPetIds
          .map((petId) => petsMap[petId])
          .filter((pet) => pet); // Simply filter out undefined pets

        console.log(
          `Booking ${booking.booking_id} has ${bookingPetsData.length} pets`
        ); // Debug log

        // Format dates
        let bookedDate = "N/A";
        let durationHours = 0;

        if (booking.start_time && booking.end_time) {
          const start = new Date(booking.start_time);
          const end = new Date(booking.end_time);

          if (!isNaN(start) && !isNaN(end)) {
            durationHours = Math.round((end - start) / (1000 * 60 * 60));

            const startDay = start.getDate();
            const startMonth = start.toLocaleString("en-US", {
              month: "short",
            });
            const startHour = start.getHours();
            const startMinute = start.getMinutes().toString().padStart(2, "0");
            const startAmPm = startHour >= 12 ? "PM" : "AM";
            const startHour12 = startHour % 12 || 12;

            const endDay = end.getDate();
            const endMonth = end.toLocaleString("en-US", { month: "short" });
            const endHour = end.getHours();
            const endMinute = end.getMinutes().toString().padStart(2, "0");
            const endAmPm = endHour >= 12 ? "PM" : "AM";
            const endHour12 = endHour % 12 || 12;

            // If same day, show date once
            if (start.toDateString() === end.toDateString()) {
              bookedDate = `${startDay} ${startMonth}, ${startHour12}:${startMinute} ${startAmPm} - ${endHour12}:${endMinute} ${endAmPm}`;
            } else {
              bookedDate = `${startDay} ${startMonth}, ${startHour12}:${startMinute} ${startAmPm} - ${endDay} ${endMonth}, ${endHour12}:${endMinute} ${endAmPm}`;
            }
          }
        }

        // Format pet data for the response
        const formattedPets = bookingPetsData.map((p) => ({
          id: p.pet_id || "unknown",
          name: p.pet_name || "Unknown Pet",
          image: p.pet_image_url || null,
          type: p.pet_type || "Pet",
        }));

        return {
          id: booking.booking_id,
          owner_id: booking.owner_id,
          owner_name: owner?.name || "Unknown Owner",
          owner_image: owner?.profile_image_url || null,
          pet_count: bookingPetIds.length, // Correctly count pets
          pets: formattedPets, // Include pet details
          duration: durationHours,
          booked_date: bookedDate,
          start_time: booking.start_time,
          end_time: booking.end_time,
          total_price: booking.total_price,
          status: booking.status || "unknown",
          message: booking.message || "",
        };
      } catch (error) {
        console.error("Error formatting booking:", error);
        return {
          id: booking.booking_id || "error",
          owner_name: "Error processing booking",
          owner_image: null,
          pet_count: 0,
          pets: [],
          duration: 0,
          booked_date: "N/A",
          status: booking.status || "unknown",
        };
      }
    });

    console.log(`Successfully processed ${formattedBookings.length} bookings`);
    return res.status(200).json({ data: formattedBookings });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}
