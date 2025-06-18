// ReviewDetailModal.js
import React from "react";

export default function ReviewDetailModal({ open, onClose, review }) {
  if (!open || !review) return null;

  const date = new Date(review.created_at).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ฟังก์ชันนำทางไปหน้าของ Pet Sitter
  const handleViewSitter = () => {
    if (review.sitter_id) {
      window.location.href = `/pet-sitters/${review.sitter_id}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow relative">
        <button
          className="absolute top-4 right-4 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">
          Your Rating and Review
        </h2>
        <div className="flex items-center gap-4 mb-2">
          <img
            src={review.owner_avatar}
            alt={review.owner_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{review.owner_name}</div>
            <div className="text-xs text-gray-500">{date}</div>
          </div>
          <div className="flex ml-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  color: i <= review.rating ? "#22c55e" : "#e5e7eb",
                  fontSize: 20,
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="mb-6">{review.comment}</div>
        <button
          className="bg-[#FFF1EA] text-[#FF7037] px-6 py-2 rounded-full font-medium"
          onClick={handleViewSitter}
        >
          View Pet Sitter
        </button>
      </div>
    </div>
  );
}