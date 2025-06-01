'use client';
import { useEffect, useState } from 'react';
import BookingCard from "@/components/profile/BookingCard";
import Sidebar from "@/components/profile/Sidebar";

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
        value: new Date(completedAt || paidAt || createdAt).toLocaleDateString(),
      };
    } else {
      return {
        label: "Transaction date",
        value: new Date(createdAt).toLocaleDateString(),
      };
    }
  }

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/booking');
        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();

        // ✅ เพิ่ม getStatusDate ก่อน setBookings
        const mapped = data.map((booking) => ({
          ...booking,
          statusDate: getStatusDate(booking),
        }));

        setBookings(mapped);
      } catch (error) {
        console.error("Error loading bookings:", error);
        setBookings([]); // fallback เพื่อไม่ให้ error map ตอน render
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">

          {/* Sidebar ซ้าย */}
          <Sidebar />

          {/* รายการ Booking ด้านขวา */}
          <div className="self-start">
            <div className="bg-white p-10 rounded-2xl shadow-md ">
              <h1 className="text-2xl font-bold mb-14">Booking History</h1>

              {loading && <p>Loading...</p>}

              {bookings.map((booking, index) => (
                <BookingCard key={booking.booking_id || index} booking={booking} />
              ))}

              {!loading && bookings.length === 0 && (
                <p className="text-gray-500">No bookings found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
