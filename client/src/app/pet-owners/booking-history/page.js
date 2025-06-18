"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/profile/Sidebar";
import BookingCard from "@/components/profile/BookingCard";
import BookingDetailModal from "@/components/profile/BookingDetailModal";
import ReviewModal from "@/components/reviews/reviews";
import ReviewDetailModal from "@/components/reviews/reviews-detail";

function mapStatus(status) {
  if (
    status === "waiting for confirm" ||
    status === "pending" ||
    status === "waiting for service"
  ) {
    return "Waiting for confirm";
  }
  if (status === "in service") {
    return "In service";
  }
  if (status === "success") {
    return "Success";
  }
  if (status === "cancelled") {
    return "Cancelled";
  }
  return status;
}

// เพิ่มฟังก์ชันช่วย format
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}
function formatTime(timeStr) {
  if (!timeStr) return "";
  const d = new Date(timeStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
function calcDuration(start, end) {
  if (!start || !end) return "-";
  const s = new Date(start);
  const e = new Date(end);
  const diff = (e - s) / (1000 * 60 * 60);
  return `${diff} hours`;
}

export default function BookingHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [openReview, setOpenReview] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [openReviewDetail, setOpenReviewDetail] = useState(false);
  const [reviewDetail, setReviewDetail] = useState(null);

  function getStatusDate(booking) {
    const status = booking.status;
    const createdAt = booking.created_at;
    const paidAt = booking.paid_at;
    const completedAt = booking.completed_at;

    if (status === "Pending") {
      return {
        label: "Created at",
        value: new Date(createdAt).toLocaleDateString(),
      };
    } else if (status === "Paid") {
      return {
        label: "Paid at",
        value: new Date(paidAt || createdAt).toLocaleDateString(),
      };
    } else if (status === "Completed") {
      return {
        label: "Completed at",
        value: new Date(
          completedAt || paidAt || createdAt
        ).toLocaleDateString(),
      };
    } else {
      return {
        label: "Transaction date",
        value: new Date(createdAt).toLocaleDateString(),
      };
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectPath", window.location.pathname);
      }
      router.replace("/login");
      return;
    }
    if (user.role !== "owner") {
      router.replace("/");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/booking/booking-list-owner");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const { data } = await res.json();

        // ดึง booking_id ที่ status success
        const successBookingIds = data
          .filter(b => mapStatus(b.status) === "Success")
          .map(b => b.booking_id);

        // เรียก API เช็ครีวิวทั้งหมดในครั้งเดียว
        let reviewedMap = {};
        if (successBookingIds.length > 0) {
          const reviewRes = await fetch("/api/reviews/check-many", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ booking_ids: successBookingIds }),
          });
          const { reviewed } = await reviewRes.json();
          // reviewed: { [booking_id]: true/false }
          reviewedMap = reviewed || {};
        }

        // map field สำหรับ BookingCard
        const bookingsWithFields = data.map((booking) => {
          const date = booking.date || formatDate(booking.start_time || booking.created_at);
          const time =
            booking.start_time && booking.end_time
              ? `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`
              : booking.time || "-";
          const duration =
            booking.duration ||
            calcDuration(booking.start_time, booking.end_time) ||
            "-";
          const pet =
            Array.isArray(booking.pets) && booking.pets.length > 0
              ? booking.pets.map((p) => p.name).join(", ")
              : "-";

          return {
            ...booking,
            status: mapStatus(booking.status),
            statusDate: getStatusDate(booking),
            sitter_name: booking.sitter_trade_name,
            image: booking.sitter_profile_image,
            date,
            time,
            duration,
            pet,
            sitter_id: booking.sitter_id || booking.sitter_user_id,
            owner_id: booking.owner_id || user?.id,
            reviewed: reviewedMap[booking.booking_id] || false, // เพิ่มตรงนี้
          };
        });

        setBookings(bookingsWithFields);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล booking");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, router]);

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    if (statusFilter === "All") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  // ฟังก์ชันโหลดรีวิว
  const handleShowReview = async (booking) => {
    // ดึงรีวิวจาก API
    const res = await fetch(`/api/reviews?booking_id=${booking.booking_id}`);
    if (res.ok) {
      const { data } = await res.json();

      // ดึงโปรไฟล์ owner จาก API
      let ownerName = "You";
      let ownerAvatar = "/assets/default-avatar.png";
      if (data.reviewer_id) {
        const profileRes = await fetch(`/api/profile?user_id=${data.reviewer_id}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          ownerName = profile.name || ownerName;
          ownerAvatar = profile.profile_image_url || ownerAvatar;
        }
      }

      setReviewDetail({
        ...data,
        owner_name: ownerName,
        owner_avatar: ownerAvatar,
      });
      setOpenReviewDetail(true);
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#FF7C43] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-[#FAFAFB]">
      <div className="md:px-20 md:pt-10 md:pb-20">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:max-w-81 md:max-h-89 flex md:gap-6 md:pr-8">
            <Sidebar />
          </div>
          <div className="w-full">
            <div className="bg-white flex flex-col px-4 py-6 md:p-10 md:rounded-2xl gap-6 md:gap-15 w-full">
              <h1 className="text-2xl font-bold">Booking History</h1>

              {/* Filter by status */}
              <div className="mb-4 flex flex-row items-center gap-2">
                <label className="font-medium">Filter by status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="All">All</option>
                  <option value="Waiting for confirm">Waiting for confirm</option>
                  <option value="In service">In service</option>
                  <option value="Success">Success</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings found.</p>
              ) : (
                filteredBookings.map((booking, index) => (
                  <div key={booking.booking_id || index}>
                    <BookingCard
                      booking={booking}
                      onClick={() => setSelectedBooking(booking)}
                      onReview={b => {
                        setReviewBooking(b);
                        setOpenReview(true);
                      }}
                      onShowReview={handleShowReview} // เพิ่ม prop นี้
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        open={openReview}
        onClose={() => setOpenReview(false)}
        booking={reviewBooking}
        onSuccess={() => {
          setOpenReview(false);
          // อัปเดต bookings หรือแจ้งเตือนสำเร็จ
        }}
      />

      {/* Review Detail Modal */}
      <ReviewDetailModal
        open={openReviewDetail}
        onClose={() => setOpenReviewDetail(false)}
        review={reviewDetail}
      />
    </div>
  );
}
