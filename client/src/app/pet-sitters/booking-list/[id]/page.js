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
import Modal from "@/components/Modal";

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
    text: "Cancelled",
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
const PetCard = ({ pet, onClick }) => (
  <div
    className="text-center border border-[#DCDFED] p-6 gap-4 rounded-2xl bg-white w-[207px] h-[240px] flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
    onClick={() => onClick(pet)}
  >
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

// เพิ่ม Pet Modal Component
const PetDetailModal = ({ pet, isOpen, onClose }) => {
  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 bg-[#00000066] z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-200 min-h-138">
        <div className="flex justify-between items-center px-6 md:px-10 py-3 md:py-6 border-b border-[#DCDFED] h-20 box-border">
          <h2 className="text-2xl font-bold text-black">{pet.name || "N/A"}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-4xl w-6 h-6 text-[#3A3B46] hover:text-gray-400"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-row items-center p-5 md:p-10 gap-15">
          <div className="flex flex-col md:flex-row gap-5 md:gap-10 w-full">
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Pet Image */}
              <div className="w-45 h-45 md:w-60 md:h-60 rounded-full overflow-hidden">
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

              {/* Pet Name */}
              <h3 className="text-xl font-bold">{pet.name}</h3>
            </div>
            {/* Pet Details */}
            <div className="w-full flex flex-col gap-5 md:gap-10 p-4 md:p-6 rounded-lg bg-[#FAFAFB]">
              <div className="flex flex-row gap-5 md:gap-10">
                <DetailItem label="Pet Type" value={pet.type} />
                <DetailItem label="Breed" value={pet.breed || "N/A"} />
              </div>
              <div className="flex flex-row gap-5 md:gap-10">
                <DetailItem label="Sex" value={pet.sex || "N/A"} />
                <DetailItem label="Age" value={pet.age || "N/A"} />
              </div>
              <div className="flex flex-row gap-5 md:gap-10">
                <DetailItem label="Color" value={pet.color || "N/A"} />
                <DetailItem
                  label="Weight"
                  value={pet.weight ? `${pet.weight} kg` : "N/A"}
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <DetailItem
                  label="About"
                  value={pet.about || "No additional information"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for pet details
const DetailItem = ({ label, value }) => (
  <div className="w-full flex flex-col gap-1">
    <h4 className="text-xl text-[#AEB1C3] font-bold">{label}</h4>
    <p className="text-black font-normal">{value}</p>
  </div>
);

// Component to display owner profile modal
const OwnerProfileModal = ({ owner, isOpen, onClose }) => {
  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 bg-[#00000066] z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-200 min-h-138">
        {/* Header with close button */}
        <div className="flex justify-between items-center px-6 md:px-10 py-3 md:py-6 border-b border-[#DCDFED] h-20 box-border">
          <h2 className="text-2xl font-bold text-black">
            {owner.name || "Pet Owner"}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-4xl w-6 h-6 text-[#3A3B46] hover:text-gray-400"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col md:flex-row p-5 md:p-10 gap-5 md:gap-10">
          {/* Left column with profile image */}
          <div className="flex-shrink-0 flex flex-col items-center gap-6">
            <div className="w-45 h-45 md:w-60 md:h-60 rounded-full overflow-hidden">
              {owner.profile_image_url ? (
                <img
                  src={owner.profile_image_url}
                  alt={owner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Right column with owner details */}
          <div className="flex-1 flex flex-col gap-5 md:gap-10 p-4 md:p-6 bg-[#FAFAFB] rounded-lg">
            <div className="flex flex-col gap-1">
              <h4 className="text-[#AEB1C3] text-xl font-bold">
                Pet Owner Name
              </h4>
              <p className="text-black font-medium">{owner.name || "N/A"}</p>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-[#AEB1C3] text-xl font-bold">Email</h4>
              <p className="text-black font-medium">{owner.email || "N/A"}</p>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-[#AEB1C3] text-xl font-bold">Phone</h4>
              <p className="text-black font-medium">{owner.phone || "N/A"}</p>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-[#AEB1C3] text-xl font-bold">
                Date of Birth
              </h4>
              <p className="text-black font-medium">
                {owner.birthday || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth(); // ใช้ user จาก context
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [timeNow, setTimeNow] = useState(new Date());

  const handleOpenPetModal = (pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  const handleClosePetModal = () => {
    setIsModalOpen(false);
    setSelectedPet(null);
  };

  // Add this useEffect to update the time every minute - place after the other useEffect
  useEffect(() => {
    // Only set up timer if booking is in "in service" status
    if (booking?.status === "in service") {
      const timer = setInterval(() => {
        setTimeNow(new Date());
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [booking?.status]);

  // Add this function to check if the complete service button should be enabled - place before renderActionButtons
  const isCompleteServiceEnabled = () => {
    if (!booking || !booking.end_time) return false;

    const endTime = new Date(booking.end_time);
    return timeNow >= endTime;
  };

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
      alert("Error loading booking details. Please try again.");
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
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = () => {
    setIsRejectModalOpen(true);
  };

  // Add this new function to handle the actual rejection
  const confirmRejectBooking = async () => {
    try {
      setActionLoading(true);
      await axios.post(
        `/api/pet-sitters/bookings/${id}/reject`,
        {},
        {
          withCredentials: true,
        }
      );

      // Update local state after successful API call
      setBooking((prev) => ({
        ...prev,
        status: "cancelled",
      }));
    } catch (error) {
      alert("Failed to reject booking. Please try again.");
    } finally {
      setIsRejectModalOpen(false);
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
        // Update the in-service case to check if button should be enabled
        const isEnabled = isCompleteServiceEnabled();
        const buttonTooltip = isEnabled
          ? ""
          : "Button will be enabled at the end of booking time";

        return (
          <div className="relative group">
            <ButtonOrange
              text="Success"
              onClick={handleCompleteService}
              disabled={!isEnabled || actionLoading}
            />
            {!isEnabled && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {buttonTooltip}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleViewOwnerProfile = async () => {
    try {
      if (!booking) {
        return;
      }

      // สร้าง object จากข้อมูลที่มีอยู่แล้วใน booking
      // ไม่จำเป็นต้องมี booking.owner_id
      const ownerInfo = {
        name: booking.owner_name || "Unknown Owner",
        email: booking.owner_email || "",
        phone: booking.owner_phone || "",
        profile_image_url: booking.owner_image || "",
        birthday: booking.owner_birthday || "",
      };
      setOwnerData(ownerInfo);
      setIsOwnerModalOpen(true);
    } catch (error) {
      alert("Error loading owner profile. Please try again.");
    }
  };

  const handleCloseOwnerModal = () => {
    setIsOwnerModalOpen(false);
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
                <Sidebar className="flex flex-row md:hidden bg-white shadow-[4px_4px_24px_0px_#0000000A]" />
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
                <Sidebar className="flex flex-row md:hidden bg-white shadow-[4px_4px_24px_0px_#0000000A]" />
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
              <Sidebar className="flex flex-row md:hidden bg-white shadow-[4px_4px_24px_0px_#0000000A]" />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 flex flex-col w-full bg-[#F6F6F9] gap-6 px-4 py-6 md:px-10 md:pb-20 md:pt-10 relative mt-[123px] md:mt-[72px]">
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
            <div className="bg-white rounded-2xl px-10 md:px-20 py-10 gap-6 flex flex-col">
              {/* Pet Owner section */}
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-[#AEB1C3]">
                  Pet Owner Name
                </h3>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-black font-medium">
                    {booking.owner_name || "N/A"}
                  </p>
                  <button
                    className="flex flex-row items-center gap-1 px-0.5 py-1 rounded-full cursor-pointer"
                    onClick={handleViewOwnerProfile}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.9199 11.6C19.8999 6.91 16.0999 4 11.9999 4C7.89994 4 4.09994 6.91 2.07994 11.6C2.02488 11.7262 1.99646 11.8623 1.99646 12C1.99646 12.1377 2.02488 12.2738 2.07994 12.4C4.09994 17.09 7.89994 20 11.9999 20C16.0999 20 19.8999 17.09 21.9199 12.4C21.975 12.2738 22.0034 12.1377 22.0034 12C22.0034 11.8623 21.975 11.7262 21.9199 11.6ZM11.9999 18C8.82994 18 5.82994 15.71 4.09994 12C5.82994 8.29 8.82994 6 11.9999 6C15.1699 6 18.1699 8.29 19.8999 12C18.1699 15.71 15.1699 18 11.9999 18ZM11.9999 8C11.2088 8 10.4355 8.2346 9.77766 8.67412C9.11987 9.11365 8.60718 9.73836 8.30443 10.4693C8.00168 11.2002 7.92246 12.0044 8.0768 12.7804C8.23114 13.5563 8.61211 14.269 9.17152 14.8284C9.73093 15.3878 10.4437 15.7688 11.2196 15.9231C11.9955 16.0775 12.7998 15.9983 13.5307 15.6955C14.2616 15.3928 14.8863 14.8801 15.3258 14.2223C15.7653 13.5645 15.9999 12.7911 15.9999 12C15.9999 10.9391 15.5785 9.92172 14.8284 9.17157C14.0782 8.42143 13.0608 8 11.9999 8ZM11.9999 14C11.6044 14 11.2177 13.8827 10.8888 13.6629C10.5599 13.4432 10.3036 13.1308 10.1522 12.7654C10.0008 12.3999 9.9612 11.9978 10.0384 11.6098C10.1155 11.2219 10.306 10.8655 10.5857 10.5858C10.8654 10.3061 11.2218 10.1156 11.6098 10.0384C11.9977 9.96126 12.3999 10.0009 12.7653 10.1522C13.1308 10.3036 13.4431 10.56 13.6629 10.8889C13.8826 11.2178 13.9999 11.6044 13.9999 12C13.9999 12.5304 13.7892 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 11.9999 14Z"
                        fill="#FF7037"
                      />
                    </svg>
                    <p className="text-[#FF7037] font-bold hover:underline">
                      View Profile
                    </p>
                  </button>
                </div>
              </div>

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
                  <div className="flex flex-wrap flex-col md:flex-row gap-4">
                    {booking.pets.map((pet, index) => (
                      <PetCard
                        key={pet.id || index}
                        pet={pet}
                        onClick={handleOpenPetModal}
                      />
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
      <PetDetailModal
        pet={selectedPet}
        isOpen={isModalOpen}
        onClose={handleClosePetModal}
      />
      <OwnerProfileModal
        owner={ownerData}
        isOpen={isOwnerModalOpen}
        onClose={handleCloseOwnerModal}
      />
      <Modal
        open={isRejectModalOpen}
        title="Reject Confirmation"
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmRejectBooking}
        confirmText="Reject Booking"
        cancelText="Cancel"
        disabled={actionLoading}
        maxWidthClass="md:max-w-100"
      >
        <p className="text-[#7B7E8F] font-medium leading-7">
          Are you sure to reject this booking?
        </p>
      </Modal>
    </div>
  );
}
