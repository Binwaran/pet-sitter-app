"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/profile/Sidebar";
import BookingCard from "@/components/profile/BookingCard";
import BookingDetailModal from "@/components/profile/BookingDetailModal"; // ✅ import modal

export default function BookingHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null); // ✅ state modal

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
      // เก็บ path ปัจจุบันไว้ใน sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectPath", window.location.pathname);
      }
      router.replace("/login");
      return;
    }
    if (user.role !== "owner") {
      router.replace("/"); // เปลี่ยนเส้นทางไปยังหน้าอื่นถ้าไม่ใช่ owner
      return;
    }
    if (!user.id) {
      setError("ไม่พบ owner_id ในบัญชีนี้");
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/booking?owner_id=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        const mapped = data.map((booking) => ({
          ...booking,
          statusDate: getStatusDate(booking),
        }));
        setBookings(mapped);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล booking");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, router]);

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
              {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings found.</p>
              ) : (
                bookings.map((booking, index) => {
                  console.log("Booking:", booking); // ✅ ถูกต้อง
                  return (
                    <BookingCard
                      key={booking.booking_id || index}
                      booking={booking}
                      onClick={() => setSelectedBooking(booking)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
