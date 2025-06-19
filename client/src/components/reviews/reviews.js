import { useState } from "react";

export default function ReviewModal({ open, onClose, booking, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: booking.booking_id,
        sitter_id: booking.sitter_id,
        reviewer_id: booking.owner_id,
        rating,
        comment,
      }),
    });
    setLoading(false);
    if (res.ok) {
      onSuccess?.();
      onClose();
    } else {
      alert("Failed to submit review");
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
        <h2 className="text-xl font-bold mb-6 text-center">Rating & Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <div className="font-semibold mb-4 text-center text-lg">
              What is your rate?
            </div>
            <div className="flex gap-4 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform duration-100"
                  aria-label={`Rate ${star}`}
                  style={{
                    transform: rating === star ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  <span
                    style={{
                      color: rating >= star ? "#22c55e" : "#e5e7eb",
                    }}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <div className="font-semibold mb-4 text-center text-lg">
              Share more about your experience
            </div>
            <textarea
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-between gap-2">
            <button
              type="button"
              className="px-8 py-2 rounded-full bg-[#FFF1EC] text-[#FF7037] font-semibold transition hover:bg-[#FFE4D9]"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 rounded-full bg-[#FF7037] text-white font-semibold transition hover:bg-[#FF986F] disabled:opacity-60"
              disabled={loading || rating === 0}
            >
              Send Review&Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}