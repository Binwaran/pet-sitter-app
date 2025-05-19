import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import Image from "next/image";
import { Pagination, PaginationItem } from "@mui/material";
import Modal from "@/components/Modal";

// ย้ายค่าคงที่ออกมาไว้ด้านนอกเพื่อไม่ต้องสร้างใหม่ทุกครั้ง
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const REVIEWS_PER_PAGE = 5;
const PAGINATION_STYLES = {
  "& .MuiPaginationItem-root": {
    backgroundColor: "#FFFFFF",
    color: "#AEB1C3",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "16px",
    width: 40,
    height: 40,
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#FFF1EC",
    color: "#FF7037",
  },
  "& .MuiPaginationItem-root.Mui-selected:hover, & .MuiPaginationItem-root.Mui-selected.Mui-focusVisible":
    {
      backgroundColor: "#FFF1EC",
      color: "#FF7037",
    },
  "& .MuiPaginationItem-previousNext": {
    width: 36,
    height: 36,
    backgroundColor: "#F6F6F9",
  },
  "& .MuiPaginationItem-ellipsis": {
    verticalAlign: "bottom",
    display: "inline-flex",
    alignItems: "flex-end",
    justifyContent: "center",
    width: 40,
    height: 25,
    backgroundColor: "#F6F6F9",
  },
};

// Component สำหรับการ Rating ด้วย Star
const Rating = memo(({ value }) => (
  <div className="flex gap-0.5 rounded-lg">
    {[...Array(Math.round(value))].map((_, i) => (
      <div key={i}>
        <Image
          src="/assets/star-rating.svg"
          alt="star"
          width={20}
          height={20}
          priority
        />
      </div>
    ))}
  </div>
));

Rating.displayName = "Rating";

// Component สำหรับ Delete Modal
const DeleteConfirmModal = memo(
  ({ isOpen, onClose, onConfirm, isDeleting }) => (
    <Modal
      open={isOpen}
      title="Delete Confirmation"
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText="Delete"
      cancelText="Cancel"
      disabled={isDeleting}
      maxWidthClass="md:max-w-[400px]"
      customStyles={{
        container: "max-w-md rounded-3xl shadow-lg p-6",
        title: "text-2xl font-medium mb-8",
        content: "py-8",
        footer: "flex justify-center space-x-4 mt-6",
        cancelButton:
          "bg-[#FFF1EC] text-[#FF7037] px-10 py-3 rounded-full font-medium text-base hover:bg-[#FFE9DF]",
        confirmButton:
          "bg-[#FF7037] text-white px-10 py-3 rounded-full font-medium text-base hover:bg-[#F76020]",
      }}
    >
      <div className="flex text-left gap-[11px]">
        <p className="text-[#7B7E8F]">Are you sure to delete this review?</p>
      </div>
    </Modal>
  )
);

DeleteConfirmModal.displayName = "DeleteConfirmModal";

// Component สำหรับแสดง PaginationControls
const PaginationControls = memo(({ count, page, onChange }) => (
  <Pagination
    count={count > 0 ? count : 1}
    page={page}
    onChange={(_, value) => onChange(value)}
    siblingCount={1}
    boundaryCount={2}
    showFirstButton={false}
    showLastButton={false}
    sx={PAGINATION_STYLES}
    renderItem={(item) => (
      <PaginationItem
        {...item}
        slots={{
          previous: () => (
            <svg width={8} height={15} viewBox="0 0 8 15" fill="none">
              <path
                d="M7 1L1 7.5L7 14"
                stroke="#AEB1C3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          next: () => (
            <svg width={8} height={15} viewBox="0 0 8 15" fill="none">
              <path
                d="M1 14L7 7.5L1 1"
                stroke="#AEB1C3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        }}
      />
    )}
  />
));

PaginationControls.displayName = "PaginationControls";

// Component สำหรับแสดงแต่ละ review
const ReviewCard = memo(({ review, onReject, onToggleApprove }) => {
  // Format review date
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(review.created_at);
      if (isNaN(date.getTime())) return review.created_at;

      const day = date.getDate();
      const month = MONTHS[date.getMonth()];
      const year = date.getFullYear();

      return `${month} ${day}, ${year}`;
    } catch (e) {
      return review.created_at;
    }
  }, [review.created_at]);

  return (
    <div className="px-0 md:px-6 pt-6 pb-10 gap-4 border-b border-[#DCDFED] last:border-0 flex flex-col md:flex-row">
      <div className="flex items-start gap-4 lg:min-w-[220px]">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
          {review.reviewer_image ? (
            <img
              src={review.reviewer_image}
              alt={review.reviewer_name || "Reviewer"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-bold">
              {(review.reviewer_name || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start w-full">
          <p className="font-medium text-black text-lg leading-[26px] whitespace-nowrap">
            {review.reviewer_name || "Anonymous"}
          </p>
          <div className="flex flex-col">
            <div className="font-medium text-sm text-[#7B7E8F] whitespace-nowrap">
              {formattedDate}
            </div>
            {review.verified && (
              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium mt-1 inline-flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 w-full">
        <Rating value={review.rating} />
        <p className="font-medium text-[#344054] leading-7 text-[16px]">
          {review.comment}
        </p>
      </div>

      <div className="flex items-start justify-center md:justify-end w-full md:w-fit gap-2">
        <button
          onClick={() => onReject(review)}
          className="flex items-center justify-center w-15 h-15 rounded-full bg-[#F7F7FA] hover:bg-[#F9FAFB] text-[#AEB1C4] hover:text-[#AEB1C4] transition-colors duration-200 cursor-pointer"
          aria-label="Reject review"
        >
          <svg
            width="18"
            height="20"
            viewBox="0 0 18 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 16C7.26522 16 7.51957 15.8946 7.70711 15.7071C7.89464 15.5196 8 15.2652 8 15V9C8 8.73478 7.89464 8.48043 7.70711 8.29289C7.51957 8.10536 7.26522 8 7 8C6.73478 8 6.48043 8.10536 6.29289 8.29289C6.10536 8.48043 6 8.73478 6 9V15C6 15.2652 6.10536 15.5196 6.29289 15.7071C6.48043 15.8946 6.73478 16 7 16ZM17 4H13V3C13 2.20435 12.6839 1.44129 12.1213 0.87868C11.5587 0.316071 10.7956 0 10 0H8C7.20435 0 6.44129 0.316071 5.87868 0.87868C5.31607 1.44129 5 2.20435 5 3V4H1C0.734784 4 0.48043 4.10536 0.292893 4.29289C0.105357 4.48043 0 4.73478 0 5C0 5.26522 0.105357 5.51957 0.292893 5.70711C0.48043 5.89464 0.734784 6 1 6H2V17C2 17.7956 2.31607 18.5587 2.87868 19.1213C3.44129 19.6839 4.20435 20 5 20H13C13.7956 20 14.5587 19.6839 15.1213 19.1213C15.6839 18.5587 16 17.7956 16 17V6H17C17.2652 6 17.5196 5.89464 17.7071 5.70711C17.8946 5.51957 18 5.26522 18 5C18 4.73478 17.8946 4.48043 17.7071 4.29289C17.5196 4.10536 17.2652 4 17 4ZM7 3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H10C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V4H7V3ZM14 17C14 17.2652 13.8946 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18H5C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V6H14V17ZM11 16C11.2652 16 11.5196 15.8946 11.7071 15.7071C11.8946 15.5196 12 15.2652 12 15V9C12 8.73478 11.8946 8.48043 11.7071 8.29289C11.5196 8.10536 11.2652 8 11 8C10.7348 8 10.4804 8.10536 10.2929 8.29289C10.1054 8.48043 10 8.73478 10 9V15C10 15.2652 10.1054 15.5196 10.2929 15.7071C10.4804 15.8946 10.7348 16 11 16Z"
              fill="#AEB1C4"
            />
          </svg>
        </button>
        <button
          onClick={() => onToggleApprove(review)}
          className={`flex items-center justify-center w-15 h-15 rounded-full transition-colors duration-200 cursor-pointer ${
            review.verified
              ? "bg-[#E7FDF4] text-[#1CCD83] hover:bg-[#E7FDF4]/80"
              : "bg-[#FEF3ED] hover:bg-[#FEF3ED]/80 text-[#FF7037]"
          }`}
          aria-label={review.verified ? "Unapprove review" : "Approve review"}
        >
          {review.verified ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-check-big-icon lucide-circle-check-big"
            >
              <path d="M21.801 10A10 10 0 1 1 17 3.335" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          ) : (
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.6335 0.347263C15.5276 0.237227 15.4017 0.149889 15.263 0.0902873C15.1243 0.0306856 14.9755 0 14.8252 0C14.6749 0 14.5261 0.0306856 14.3873 0.0902873C14.2486 0.149889 14.1227 0.237227 14.0168 0.347263L5.53519 9.10519L1.97176 5.41888C1.86187 5.30942 1.73215 5.22335 1.59 5.16558C1.44786 5.10782 1.29607 5.07949 1.14331 5.08222C0.990548 5.08494 0.839803 5.11867 0.699681 5.18147C0.559559 5.24427 0.432805 5.33491 0.326655 5.44823C0.220505 5.56154 0.137038 5.69531 0.0810208 5.84189C0.0250032 5.98846 -0.00246884 6.14498 0.000174094 6.30251C0.00281703 6.46004 0.035523 6.61548 0.0964241 6.75997C0.157325 6.90447 0.245229 7.03518 0.355117 7.14464L4.72687 11.6527C4.83271 11.7628 4.95862 11.8501 5.09736 11.9097C5.23609 11.9693 5.3849 12 5.53519 12C5.68548 12 5.83429 11.9693 5.97302 11.9097C6.11176 11.8501 6.23767 11.7628 6.34351 11.6527L15.6335 2.07302C15.749 1.96309 15.8413 1.82966 15.9044 1.68115C15.9674 1.53264 16 1.37227 16 1.21014C16 1.04801 15.9674 0.88764 15.9044 0.739132C15.8413 0.590623 15.749 0.457197 15.6335 0.347263Z"
                fill="#FF7037"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});

ReviewCard.displayName = "ReviewCard";

// Custom hook สำหรับการจัดการ reviews
function useReviewData(ownerId) {
  const [state, setState] = useState({
    reviews: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    averageRating: 0,
  });

  const fetchReviews = useCallback(async () => {
    if (!ownerId) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "No pet owner ID provided",
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const response = await axios.get(`/api/admin/pet-owners/reviews`, {
        params: {
          owner_id: ownerId,
          page: state.currentPage,
          limit: REVIEWS_PER_PAGE,
        },
      });

      if (response.data) {
        setState((prev) => ({
          ...prev,
          reviews: response.data.reviews || [],
          totalReviews: response.data.total || 0,
          totalPages: response.data.total_pages || 1,
          averageRating: response.data.average_rating || 0,
          loading: false,
          error: null,
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: `Failed to load reviews: ${err.message}`,
      }));
    }
  }, [ownerId, state.currentPage]);

  // Effect to fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const setPage = useCallback((page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      await axios.delete(`/api/admin/pet-owners/reviews?id=${reviewId}`);

      setState((prev) => {
        // คำนวณค่าใหม่หลังจากลบ review
        const newReviews = prev.reviews.filter(
          (review) => review.id !== reviewId
        );
        const newTotalReviews = prev.totalReviews - 1;
        const newTotalPages = Math.ceil(newTotalReviews / REVIEWS_PER_PAGE);

        // ย้ายไปหน้าก่อนหน้าถ้าลบรายการสุดท้ายในหน้า
        const newPage =
          prev.reviews.length === 1 && prev.currentPage > 1
            ? prev.currentPage - 1
            : prev.currentPage;

        return {
          ...prev,
          reviews: newReviews,
          totalReviews: newTotalReviews,
          totalPages: newTotalPages,
          currentPage: newPage,
        };
      });

      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const toggleApproveReview = useCallback(async (review) => {
    try {
      const isApproving = !review.verified;

      await axios.put(`/api/admin/pet-owners/reviews`, {
        id: review.id,
        verified: isApproving,
      });

      // อัพเดตสถานะ review ในข้อมูลท้องถิ่น
      setState((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.id === review.id ? { ...r, verified: isApproving } : r
        ),
      }));

      return true;
    } catch (err) {
      return false;
    }
  }, []);

  return {
    ...state,
    setPage,
    deleteReview,
    toggleApproveReview,
  };
}

// Component แสดงการ Loading
const LoadingState = memo(() => (
  <div className="w-full text-center py-12">
    <div className="animate-spin w-8 h-8 border-3 border-[#FF7037] border-t-transparent rounded-full mx-auto mb-4"></div>
    <p className="text-[#7B7E8F]">Loading reviews...</p>
  </div>
));

LoadingState.displayName = "LoadingState";

// Component หลัก
export default function ReviewsTab({ ownerId }) {
  // ใช้ custom hook เพื่อจัดการข้อมูล reviews
  const {
    reviews,
    loading,
    error,
    currentPage,
    totalPages,
    setPage,
    deleteReview,
    toggleApproveReview,
  } = useReviewData(ownerId);

  // State สำหรับ modal ลบ review
  const [modalState, setModalState] = useState({
    isOpen: false,
    reviewToDelete: null,
    isDeleting: false,
  });

  // Event handlers
  const handleRejectClick = useCallback((review) => {
    setModalState({
      isOpen: true,
      reviewToDelete: review,
      isDeleting: false,
    });
  }, []);

  const handleToggleApprove = useCallback(
    async (review) => {
      try {
        const success = await toggleApproveReview(review);
        if (!success) {
          throw new Error("Failed to update review status");
        }
      } catch (err) {
        alert(
          `Failed to ${
            review.verified ? "remove verification" : "verify"
          } review: ${err.message}`
        );
      }
    },
    [toggleApproveReview]
  );

  const handleCancelDelete = useCallback(() => {
    setModalState({
      isOpen: false,
      reviewToDelete: null,
      isDeleting: false,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!modalState.reviewToDelete) return;

    try {
      setModalState((prev) => ({ ...prev, isDeleting: true }));

      const success = await deleteReview(modalState.reviewToDelete.id);

      if (!success) {
        throw new Error("Failed to delete review");
      }

      // Reset modal state
      setModalState({
        isOpen: false,
        reviewToDelete: null,
        isDeleting: false,
      });
    } catch (err) {
      alert(
        "Failed to delete review: " +
          (err.response?.data?.message || err.message)
      );

      setModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  }, [modalState.reviewToDelete, deleteReview]);

  // If no ownerId is provided
  if (!ownerId) {
    return (
      <div className="w-full">
        <div className="w-full bg-white rounded-2xl shadow-sm p-8">
          <div className="w-full text-center py-8">
            <p className="text-red-500 font-medium">No pet owner ID provided</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F6F9] w-full gap-10">
      {/* Modal ยืนยันการลบรีวิว */}
      <DeleteConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={modalState.isDeleting}
      />

      <div className="w-full flex flex-col items-center bg-white md:rounded-tr-2xl rounded-br-2xl rounded-bl-2xl gap-10 px-8 py-10 md:px-0 md:py-10 lg:p-10">
        {/* Loading, Error and Empty states */}
        {loading && <LoadingState />}

        {!loading && error && (
          <div className="w-full text-center py-12 px-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="w-full text-center py-12">
            <p className="text-[#7B7E8F]">
              No reviews found for this pet owner.
            </p>
          </div>
        )}

        {/* Review Cards */}
        {!loading && !error && reviews.length > 0 && (
          <div className="flex flex-col gap-10 w-full">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReject={handleRejectClick}
                onToggleApprove={handleToggleApprove}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && reviews.length > 0 && (
          <div className="flex justify-center items-baseline flex-wrap">
            <PaginationControls
              count={totalPages}
              page={currentPage}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
