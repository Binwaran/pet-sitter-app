import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/utils/supabase";

const renderStars = (count) => {
  if (!count || isNaN(count)) return null;
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push(
      <FontAwesomeIcon key={i} icon={faStar} className="text-orange-400" />
    );
  }
  return stars;
};

export default function ReviewSection({ sitterId }) {
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [activeRatingFilter, setActiveRatingFilter] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: sitterData, error: sitterError },
        { count, error: reviewsCountError },
        { data: reviewList, error: reviewListError },
        { data: usersData, error: usersError },
      ] = await Promise.all([
        supabase
          .from("pet_sitter")
          .select("average_rating")
          .eq("user_id", sitterId)
          .single(),
        supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("sitter_id", sitterId),
        supabase
          .from("reviews")
          .select("*")
          .eq("sitter_id", sitterId)
          .order("created_at", { ascending: false }),
        supabase.from("users").select("id, name, profile_image_url"),
      ]);

      if (!sitterError) setAverageRating(sitterData?.average_rating);
      if (!reviewsCountError) setTotalReviews(count || 0);

      if (reviewListError || usersError) {
        return;
      }

      const userMap = {};
      usersData.forEach((u) => {
        userMap[u.id] = u;
      });

      const enriched = reviewList.map((r) => ({
        ...r,
        user: userMap[r.reviewer_id] || {},
      }));

      setReviews(enriched);
    };

    if (sitterId) fetchData();
  }, [sitterId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeRatingFilter]);

  const filtered = activeRatingFilter
    ? reviews.filter((r) => r.rating === activeRatingFilter)
    : reviews;

  const paginated = filtered.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const totalPages = Math.ceil(filtered.length / reviewsPerPage);

  return (
    <div className="w-[90%] bg-stone-200 p-10 rounded-tl-[4rem] flex flex-col gap-6 mx-auto">
      <div className="bg-white flex flex-col  sm:flex-row rounded-tl-[4rem] rounded-tr-[1rem] sm:rounded-tr-[1rem] rounded-br-[1rem] sm:rounded-br-[1rem] rounded-bl-[1rem] sm:rounded-tl-full  sm:rounded-bl-full overflow-hidden p-2">
        {/* LEFT BLACK CIRCLE */}
        <div className="bg-black text-white mx-3 my-3  w-25 h-25 sm:w-38 sm:h-30 flex flex-col justify-center items-center rounded-tl-full rounded-tr-full rounded-bl-full">
          <span className="text-5xl font-thin">
            {averageRating !== null ? Math.round(averageRating) : "-"}
          </span>
          <span className="text-xs">{totalReviews} Reviews</span>
        </div>

        {/* RIGHT TEXT SIDE */}
        <div className="flex flex-col justify-center px-6 py-4">
          <h1 className="text-xl font-semibold mb-2">Rating & Reviews</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveRatingFilter(null)}
              className={`px-3 py-1 border rounded text-sm cursor-pointer ${
                activeRatingFilter === null
                  ? "bg-white text-orange-500"
                  : "bg-orange-500 text-white border-gray-300"
              }`}
            >
              All Reviews
            </button>
            {[5, 4, 3, 2, 1].map((val) => (
              <button
                key={val}
                onClick={() => setActiveRatingFilter(val)}
                className={`px-3 py-1 border rounded text-sm flex items-center gap-1 cursor-pointer ${
                  val === activeRatingFilter
                    ? "bg-orange-500 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                {val} {renderStars(val)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="flex flex-col gap-6 mx-5 my-3">
        {paginated.map((review) => (
          <div
            key={review.id}
            className="border-t border-gray-300 pt-4 flex flex-col sm:flex-row gap-4"
          >
            <div className="flex gap-3 items-start sm:w-[30%] ml-1 mt-5">
              <Image
                src={review.user?.profile_image_url || "/placeholder.jpg"}
                alt="avatar"
                width={50}
                height={50}
                className="rounded-full object-cover w-[50px] h-[50px]"
              />
              <div>
                <p className="font-semibold">
                  {review.user?.name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="sm:w-[70%] flex flex-col gap-2">
              <div>{renderStars(review.rating)}</div>
              <div className="text-gray-700 leading-relaxed">
                {review.comment}
              </div>
            </div>
          </div>
        ))}
        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            {/* Prev Icon */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="disabled:opacity-80 cursor-pointer"
            >
              <Image
                src="/assets/arrow1.png"
                alt="prev"
                width={50}
                height={50}
              />
            </button>

            {/* Numbered buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-5 py-2 rounded-full text-xl ${
                  page === currentPage
                    ? "bg-orange-200 text-orange-500"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Icon */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="disabled:opacity-60 cursor-pointer"
            >
              <Image
                src="/assets/arrow2.png"
                alt="next"
                width={50}
                height={50}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
