import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchSitters = async () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables not set.");
  }

  // ดึงข้อมูล users มาด้วย (join)
  const { data, error } = await supabase
    .from("pet_sitter")
    .select("*, users(profile_image_url, name)");

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  const mappedData = data.map((pet_sitter, index) => {
    if (!pet_sitter) {
      return null;
    }

    const transformedSitter = {
      id: pet_sitter?.user_id,
      name:
        pet_sitter?.trade_name ||
        `Pet Sitter ${pet_sitter?.user_id?.substring(0, 4) || "Unknown"}`,
      lat: pet_sitter?.lat,
      lng: pet_sitter?.lng,
      imageUrl:
        Array.isArray(pet_sitter?.gallery_image_url) &&
        pet_sitter.gallery_image_url.length > 0
          ? pet_sitter.gallery_image_url[0]
          : "/images/default-sitter.jpg",
      petTypes: pet_sitter?.pet_type || [],
      province: pet_sitter?.province,
      district: pet_sitter?.district,
      rating: pet_sitter?.rating,
      users: pet_sitter?.users,
    };

    return { ...pet_sitter, ...transformedSitter };
  });

  const filteredMappedData = mappedData.filter((sitter) => sitter !== null);

  return filteredMappedData;
};
