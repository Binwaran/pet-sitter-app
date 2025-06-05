"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/profile/Sidebar";
import BookingCard from "@/components/profile/BookingCard";

export default function BookingHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (authLoading || loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          <Sidebar />
          <div className="self-start">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h1 className="text-2xl font-bold mb-14">Booking History</h1>
              {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings found.</p>
              ) : (
                bookings.map((booking, index) => (
                  <BookingCard key={booking.booking_id || index} booking={booking} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
