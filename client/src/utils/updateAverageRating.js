import { supabase } from "@/utils/supabase";

export const updateAverageRating = async (petSitterId) => {
  // ดึงรีวิวทั้งหมดของ sitter คนนั้น
  const { data: reviews, error: fetchError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("pet_sitter_id", petSitterId);

  if (fetchError) {
    return;
  }

  if (!reviews || reviews.length === 0) {
    return;
  }

  // คำนวณค่าเฉลี่ย
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = total / reviews.length;

  // อัปเดต average_rating ใน pet_sitter
  const { error: updateError } = await supabase
    .from("pet_sitter")
    .update({ average_rating: average })
    .eq("id", petSitterId);

  if (updateError) {
  }
};
