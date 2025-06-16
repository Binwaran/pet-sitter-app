"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/profile/Sidebar";
import BookingCard from "@/components/profile/BookingCard";
import BookingDetailModal from "@/components/profile/BookingDetailModal";

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

export default function BookingHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

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
        const mapped = data.map((booking) => ({
          ...booking,
          status: mapStatus(booking.status), // <--- เพิ่มตรงนี้
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

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    if (statusFilter === "All") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

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
    <div className="bg-gray-100 min-h-screen">
      <div className="px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          <Sidebar />
          <div className="self-start">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h1 className="text-2xl font-bold mb-14">Booking History</h1>
              {/* Filter by status */}
              <div className="mb-6">
                <label className="mr-2 font-medium">Filter by status:</label>
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
              {filteredBookings.length === 0 ? (
                <p className="text-gray-500">No bookings found.</p>
              ) : (
                filteredBookings.map((booking, index) => (
                  <BookingCard
                    key={booking.booking_id || index}
                    booking={booking}
                    onClick={() => setSelectedBooking(booking)}
                  />
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
    </div>
  );
}
