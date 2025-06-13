import { createClient } from "@supabase/supabase-js";

// สร้าง Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // ตรวจสอบว่าเป็น method GET
  if (req.method === "GET") {
    try {
      // รับพารามิเตอร์จาก query
      const { sitter_id, page = 1, limit = 5 } = req.query;

      // ตรวจสอบว่ามี sitter_id หรือไม่
      if (!sitter_id) {
        return res.status(400).json({ message: "sitter_id is required" });
      }

      // แปลงค่า page และ limit เป็นตัวเลข
      const pageInt = parseInt(page, 10);
      const limitInt = parseInt(limit, 10);
      const offset = (pageInt - 1) * limitInt;

      // ดึงจำนวน reviews ทั้งหมดของ pet sitter คนนี้
      const { count, error: countError } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("sitter_id", sitter_id);

      if (countError) {
        console.error("Error counting reviews:", countError);
        return res.status(500).json({ message: "Failed to count reviews" });
      }

      // ดึงค่าเฉลี่ยคะแนนของ pet sitter คนนี้
      const { data: avgData, error: avgError } = await supabase
        .from("pet_sitter")
        .select("average_rating")
        .eq("user_id", sitter_id)
        .single();

      if (avgError && avgError.code !== "PGRST116") {
        console.error("Error fetching average rating:", avgError);
      }

      // ดึงข้อมูล reviews พร้อมข้อมูลผู้รีวิว และรวมถึง verified status
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          reviewer_id,
          verified,
          users:reviewer_id (
            name,
            profile_image_url
          )
        `
        )
        .eq("sitter_id", sitter_id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limitInt - 1);

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        return res.status(500).json({ message: "Failed to fetch reviews" });
      }

      // เพิ่ม console.log เพื่อตรวจสอบ
      console.log("Reviews data from DB:", reviews);

      // ตรวจสอบว่า reviews มีข้อมูลก่อนแปลง
      const formattedReviews = reviews
        ? reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            verified: review.verified || false,
            reviewer_name: review.users?.name || "Unknown",
            reviewer_image: review.users?.profile_image_url || null,
          }))
        : [];

      console.log("Formatted reviews:", formattedReviews);

      // ส่งผลลัพธ์กลับไปยัง client
      return res.status(200).json({
        reviews: formattedReviews,
        total: count,
        total_pages: Math.ceil(count / limitInt),
        current_page: pageInt,
        average_rating: avgData?.average_rating || 0,
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // สำหรับ DELETE request (ลบ review)
  else if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "Review ID is required" });
      }

      // ดึงข้อมูล review ก่อนลบ เพื่อจะได้ sitter_id ไปอัพเดทคะแนนเฉลี่ย
      const { data: reviewData, error: getError } = await supabase
        .from("reviews")
        .select("sitter_id")
        .eq("id", id)
        .single();

      if (getError) {
        console.error("Error getting review:", getError);
        return res.status(500).json({ message: "Failed to get review" });
      }

      // ลบ review
      const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting review:", deleteError);
        return res.status(500).json({ message: "Failed to delete review" });
      }

      // อัพเดทคะแนนเฉลี่ยของ pet sitter
      if (reviewData?.sitter_id) {
        const { data: ratingData, error: ratingError } = await supabase
          .from("reviews")
          .select("rating")
          .eq("sitter_id", reviewData.sitter_id);

        if (ratingError) {
          console.error("Error getting ratings:", ratingError);
          // ไม่คืน error แค่ log ข้อผิดพลาด เพราะการลบ review สำเร็จแล้ว
        }

        let averageRating = 0;
        if (ratingData && ratingData.length > 0) {
          const sum = ratingData.reduce((acc, curr) => acc + curr.rating, 0);
          averageRating = sum / ratingData.length;
        }

        // อัพเดทค่าเฉลี่ยคะแนน
        const { error: updateError } = await supabase
          .from("pet_sitter")
          .update({ average_rating: averageRating })
          .eq("user_id", reviewData.sitter_id);

        if (updateError) {
          console.error("Error updating average rating:", updateError);
        }
      }

      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Add PUT method to update review status
  else if (req.method === "PUT") {
    try {
      const { id, verified } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Review ID is required" });
      }

      // ตรวจสอบสิทธิ์ admin role ที่นี่...

      const { data, error } = await supabase
        .from("reviews")
        .update({ verified })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating review:", error);
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json({
        success: true,
        message: verified
          ? "Review verified successfully"
          : "Verification removed",
        data,
      });
    } catch (err) {
      console.error("Server error in review update:", err);
      return res.status(500).json({ message: err.message });
    }
  }

  // ถ้าเป็น method อื่น
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
