"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";
import {
  ButtonOrange,
  ButtonOrangeLight,
} from "@/components/buttons/OrangeButtons";
import { useAuth } from "@/context/AuthContext"; // เพิ่มการนำเข้า useAuth

// Pet type styles for tags
const PET_TYPE_STYLES = {
  Dog: "border-[#1CCD83] text-[#1CCD83] bg-[#E7FDF4]",
  Cat: "border-[#FA8AC0] text-[#FA8AC0] bg-[#FFF0F1]",
  Rabbit: "border-[#FF986F] text-[#FF986F] bg-[#FFF5EC]",
  Bird: "border-[#76D0FC] text-[#76D0FC] bg-[#ECFBFF]",
  Mouse: "border-[#F9C846] text-[#F9C846] bg-[#FFF9E3]",
  Turtle: "border-[#A084E8] text-[#A084E8] bg-[#F3F0FF]",
  Snake: "border-[#FF5B5B] text-[#FF5B5B] bg-[#FFECEC]",
  default: "border-[#AEB1C3] text-gray-600 bg-gray-100",
};

// Status configuration including colors and text
const STATUS_MAP = {
  "waiting for confirm": {
    text: "Waiting for confirm",
    color: "text-[#FA8AC0]",
    dot: "bg-[#FA8AC0]",
  },
  "waiting for service": {
    text: "Waiting for service",
    color: "text-[#F9C846]",
    dot: "bg-[#F9C846]",
  },
  "in service": {
    text: "In service",
    color: "text-[#76D0FC]",
    dot: "bg-[#76D0FC]",
  },
  success: {
    text: "Success",
    color: "text-[#1CCD83]",
    dot: "bg-[#1CCD83]",
  },
  cancelled: {
    text: "Canceled",
    color: "text-[#EA1010]",
    dot: "bg-[#EA1010]",
  },
};

// Component to display field label and value
const DetailField = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-xl font-bold text-[#AEB1C3]">{label}</h3>
    <p className="text-black font-medium">{value}</p>
  </div>
);

// Component to display pet type tag
const PetTypeTag = ({ type }) => {
  const style = PET_TYPE_STYLES[type] || PET_TYPE_STYLES.default;

  return (
    <span
      className={`rounded-full border px-3 md:px-4 py-1 text-[15px] md:text-[16px] font-medium ${style}`}
    >
      {type || "Pet"}
    </span>
  );
};

// Component to display pet card
const PetCard = ({ pet }) => (
  <div className="text-center border border-[#DCDFED] p-6 gap-4 rounded-2xl bg-white w-[207px] h-[240px] flex flex-col items-center">
    <div className="w-26 h-26 rounded-full overflow-hidden border-gray-200">
      {pet.image ? (
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm text-gray-500">No Image</span>
        </div>
      )}
    </div>
    <div className="flex flex-col items-center gap-2">
      <p className="font-bold text-black text-xl">{pet.name}</p>
      <PetTypeTag type={pet.type} />
    </div>
  </div>
);

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth(); // ใช้ user จาก context
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch booking details
  const fetchBookingDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      if (!user?.id) {
        router.push("/login");
        return;
      }

      const res = await axios.get(`/api/pet-sitters/bookings/${id}`, {
        withCredentials: true, // ส่ง cookie ไปกับ request
      });

      setBooking(res.data.data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      // Handle error - show error message or redirect
    } finally {
      setLoading(false);
    }
  }, [id, router, user?.id]); // เพิ่ม user?.id เป็น dependency

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  // Handle action buttons based on status
  const handleConfirmBooking = async () => {
    try {
      setActionLoading(true);
      await axios.post(
        `/api/pet-sitters/bookings/${id}/confirm`,
        {},
        {
          withCredentials: true, // ส่ง cookie ไปกับ request
        }
      );

      // Update local state after successful API call
      setBooking((prev) => ({
        ...prev,
        status: "waiting for service",
      }));
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!confirm("Are you sure you want to reject this booking?")) return;

    try {
      setActionLoading(true);
      await axios.post(
        `/api/pet-sitters/bookings/${id}/reject`,
        {},
        {
          withCredentials: true, // ส่ง cookie ไปกับ request
        }
      );

      // Update local state after successful API call
      setBooking((prev) => ({
        ...prev,
        status: "cancelled",
      }));
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Failed to reject booking. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async () => {
    try {
      setActionLoading(true);
      await axios.post(
        `/api/pet-sitters/bookings/${id}/start-service`,
        {},
        {
          withCredentials: true, // ส่ง cookie ไปกับ request
        }
      );

      // Update local state after successful API call
      setBooking((prev) => ({
        ...prev,
        status: "in service",
      }));
    } catch (error) {
      console.error("Error starting service:", error);
      alert("Failed to start service. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async () => {
    try {
      setActionLoading(true);
      await axios.post(
        `/api/pet-sitters/bookings/${id}/complete`,
        {},
        {
          withCredentials: true, // ส่ง cookie ไปกับ request
        }
      );

      // Update local state after successful API call
      setBooking((prev) => ({
        ...prev,
        status: "success",
      }));
    } catch (error) {
      console.error("Error completing service:", error);
      alert("Failed to complete service. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Get status info based on current booking status
  const getStatusInfo = () => {
    if (!booking) return {};
    const statusKey = booking.status?.toLowerCase() || "";
    return (
      STATUS_MAP[statusKey] || {
        color: "text-gray-400",
        dot: "bg-gray-400",
        text: "Unknown",
      }
    );
  };

  // Get action buttons based on booking status
  const renderActionButtons = () => {
    if (!booking) return null;

    switch (booking.status?.toLowerCase()) {
      case "waiting for confirm":
        return (
          <div className="flex gap-4">
            <ButtonOrangeLight
              text="Reject Booking"
              onClick={handleRejectBooking}
              disabled={actionLoading}
            />
            <ButtonOrange
              text="Confirm Booking"
              onClick={handleConfirmBooking}
              disabled={actionLoading}
            />
          </div>
        );

      case "waiting for service":
        return (
          <ButtonOrange
            text="In Service"
            onClick={handleStartService}
            disabled={actionLoading}
          />
        );

      case "in service":
        return (
          <ButtonOrange
            text="Success"
            onClick={handleCompleteService}
            disabled={actionLoading}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
        <div className="flex md:flex-row flex-col min-w-0">
          <Sidebar className="hidden md:flex" />
          <div className="flex-1 flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 md:left-[240px] flex flex-col">
              <Topbar className="w-full" />
              <div className="md:hidden w-full">
                <Sidebar className="flex flex-row md:hidden bg-white border-b border-[#DCDFED]" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center mt-[123px] md:mt-[72px]">
              <p className="text-lg">Loading booking details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
        <div className="flex md:flex-row flex-col min-w-0">
          <Sidebar className="hidden md:flex" />
          <div className="flex-1 flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 md:left-[240px] flex flex-col">
              <Topbar className="w-full" />
              <div className="md:hidden w-full">
                <Sidebar className="flex flex-row md:hidden bg-white border-b border-[#DCDFED]" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center mt-[123px] md:mt-[72px]">
              <p className="text-lg">Booking not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
      <div className="flex md:flex-row flex-col min-w-0">
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col">
          {/* Header container */}
          <div className="fixed top-0 left-0 right-0 z-50 md:left-[240px] flex flex-col">
            <Topbar className="w-full" />
            <div className="md:hidden w-full">
              <Sidebar className="flex flex-row md:hidden bg-white border-b border-[#DCDFED]" />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 flex flex-col w-full bg-[#F6F6F9] gap-6 px-10 pb-20 pt-10 relative mt-[123px] md:mt-[72px]">
            {/* Header with back button and status */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => router.back()}
                  className="text-[#AEB1C3] hover:text-[#7B7E8F]"
                >
                  <svg width={8} height={15} viewBox="0 0 8 15" fill="none">
                    <path
                      d="M7 1L1 7.5L7 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold">
                  {booking.owner_name || "Booking Detail"}
                </h1>
                <span
                  className={`flex items-center gap-2 font-medium ${statusInfo.color}`}
                >
                  • {statusInfo.text}
                </span>
              </div>

              {/* Action buttons based on status */}
              {renderActionButtons()}
            </div>

            {/* Booking details card */}
            <div className="bg-white rounded-2xl px-20 py-10 gap-6 flex flex-col">
              {/* Pet Owner section */}
              <DetailField
                label="Pet Owner Name"
                value={booking.owner_name || "N/A"}
              />

              {/* Pet(s) section */}
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-[#AEB1C3]">Pet(s)</h3>
                <p className="text-black font-medium">
                  {booking.pet_count || 0}
                </p>
              </div>

              {/* Pet Detail section */}
              {booking.pets?.length > 0 && (
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-[#AEB1C3]">
                    Pet Detail
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {booking.pets.map((pet, index) => (
                      <PetCard key={pet.id || index} pet={pet} />
                    ))}
                  </div>
                </div>
              )}

              {/* Duration */}
              <DetailField
                label="Duration"
                value={`${booking.duration || 0} hours`}
              />

              {/* Booking Date */}
              <DetailField
                label="Booking Date"
                value={booking.booked_date || "N/A"}
              />

              {/* Total Paid */}
              <DetailField
                label="Total Paid"
                value={`${parseFloat(booking.total_price || 0).toFixed(2)} THB`}
              />

              {/* Transaction Date */}
              <DetailField
                label="Transaction Date"
                value={booking.transaction_date || "N/A"}
              />

              {/* Transaction No. */}
              <DetailField
                label="Transaction No."
                value={booking.transaction_no || "N/A"}
              />

              {/* Additional Message */}
              <DetailField
                label="Additional Message"
                value={booking.message || "No additional message"}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
