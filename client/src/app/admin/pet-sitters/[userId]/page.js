"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Sidebar from "@/components/admin/SidebarAdmin";
import {
  ButtonOrange,
  ButtonOrangeLight,
} from "@/components/buttons/OrangeButtons";
import Modal from "@/components/Modal";
import ProfileTab from "@/components/admin/pet-sitters/ProfileTab";
import BookingTab from "@/components/admin/pet-sitters/BookingTab";
import ReviewsTab from "@/components/admin/pet-sitters/ReviewsTab";
import exclamation from "/public/assets/profile/exclamation-circle.svg";

// แยกข้อมูล status เป็น constants แยกต่างหาก
const STATUS_MAP = {
  "waiting for approval": {
    text: "Waiting for approve",
    color: "text-[#FA8AC0]",
    dot: "bg-[#FA8AC0]",
  },
  approved: {
    text: "Approved",
    color: "text-[#1CCD83]",
    dot: "bg-[#1CCD83]",
  },
  rejected: {
    text: "Rejected",
    color: "text-[#EA1010]",
    dot: "bg-[#EA1010]",
  },
};

// Component แสดง layout เมื่อไม่มีข้อมูล/รอข้อมูล
const EmptyLayout = ({ children }) => (
  <>
    <div className="md:hidden sticky top-0 z-30 h-[51px] md:h-full">
      <Sidebar horizontal />
    </div>
    <div className="flex flex-row w-full h-full bg-[#F6F6F9]">
      <div className="hidden md:flex h-full sticky top-0 z-30">
        <Sidebar />
      </div>
      <div className="bg-[#F6F6F9] w-full h-screen flex justify-center items-center">
        <div className="text-xl font-bold">{children}</div>
      </div>
    </div>
  </>
);

// Tab button component
const TabButton = ({ isActive, label, onClick }) => (
  <button
    className={`min-w-[100px] py-3 px-4 md:px-8 font-semibold text-[16px] md:text-[20px] ${
      isActive
        ? "text-[#FF7037] bg-white"
        : "text-[#AEB1C3] bg-[#DCDFED] hover:text-[#FF7037]"
    } ${
      label === "Profile" ? "rounded-t-xl" : "md:rounded-t-xl"
    } transition cursor-pointer`}
    onClick={onClick}
  >
    {label}
  </button>
);

export default function AdminPetSitterDetailPage() {
  const { userId } = useParams();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [modalState, setModalState] = useState({
    show: false,
    reason: "",
    isLoading: false,
  });
  const [actionState, setActionState] = useState({
    approveLoading: false,
    rejectLoading: false,
  });
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Memoized function to fetch sitter data
  const fetchSitter = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/admin/pet-sitters/${userId}?t=${Date.now()}`
      );
      setSitter(res.data.data);
    } catch (err) {
      setSitter(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Memoized function to fetch booking data
  const fetchBookings = useCallback(async () => {
    if (!sitter?.pet_sitter?.user_id) return;

    try {
      setBookingsLoading(true);
      const res = await axios.get(
        `/api/admin/bookings/${sitter.pet_sitter.user_id}`
      );
      setBookings(res.data.data || []);
    } catch (err) {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [sitter?.pet_sitter?.user_id]);

  // Update sitter data after API call
  const updateSitterStatus = useCallback((status, suggestion = null) => {
    setSitter((prev) =>
      prev
        ? {
            ...prev,
            pet_sitter: {
              ...prev.pet_sitter,
              status,
              admin_suggestion: suggestion,
            },
          }
        : null
    );
  }, []);

  // Handle approve action
  const handleApprove = useCallback(async () => {
    if (!window.confirm("Are you sure you want to approve this pet sitter?"))
      return;

    setActionState((prev) => ({ ...prev, approveLoading: true }));
    try {
      const response = await axios.post(`/api/admin/pet-sitters/approve`, {
        userId: String(userId),
      });

      if (response.data.success) {
        updateSitterStatus("approved", null);
        window.alert("Approved successfully");

        // Update with response data if available
        if (response.data.data) {
          setSitter((prev) => ({
            ...prev,
            pet_sitter: {
              ...prev.pet_sitter,
              ...response.data.data,
            },
          }));
        }
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || "Approve failed");
    } finally {
      setActionState((prev) => ({ ...prev, approveLoading: false }));
    }
  }, [userId, updateSitterStatus]);

  // Handle reject action
  const handleReject = useCallback(() => {
    setModalState((prev) => ({ ...prev, show: true }));
  }, []);

  // Handle confirm reject action
  const handleConfirmReject = useCallback(async () => {
    const { reason } = modalState;
    if (!reason.trim()) return;

    setActionState((prev) => ({ ...prev, rejectLoading: true }));
    try {
      const response = await axios.post(`/api/admin/pet-sitters/reject`, {
        userId: String(userId),
        reason,
      });

      if (response.data.success) {
        updateSitterStatus("rejected", reason);
        setModalState({ show: false, reason: "", isLoading: false });
        window.alert("Rejected successfully");

        // Update with response data if available
        if (response.data.data) {
          setSitter((prev) => ({
            ...prev,
            pet_sitter: {
              ...prev.pet_sitter,
              ...response.data.data,
            },
          }));
        }
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || "Reject failed");
    } finally {
      setActionState((prev) => ({ ...prev, rejectLoading: false }));
    }
  }, [userId, modalState, updateSitterStatus]);

  // Effect to load data on mount or tab change
  useEffect(() => {
    if (userId) {
      fetchSitter();
      if (activeTab === "booking") {
        fetchBookings();
      }
    }
  }, [userId, activeTab, fetchSitter, fetchBookings]);

  // Show loading state
  if (loading) return <EmptyLayout>Loading...</EmptyLayout>;

  // Show not found state
  if (!sitter) return <EmptyLayout>Not found</EmptyLayout>;

  const { approveLoading, rejectLoading } = actionState;
  const status = sitter.pet_sitter.status;
  const statusInfo = STATUS_MAP[status] || {
    text: "Unknown",
    color: "text-gray-400",
    dot: "bg-gray-400",
  };

  return (
    <>
      {/* Modal for Reject */}
      <Modal
        open={modalState.show}
        title="Reject Confirmation"
        onClose={() =>
          setModalState({ show: false, reason: "", isLoading: false })
        }
        onConfirm={handleConfirmReject}
        confirmText="Reject"
        cancelText="Cancel"
        disabled={!modalState.reason.trim() || rejectLoading}
        maxWidthClass="md:max-w-[600px]"
      >
        <div className="flex flex-col gap-1">
          <label className="font-medium leading-[150%]">
            Reason and suggestion
          </label>
          <textarea
            className="flex gap-2 w-full border border-[#DCDFED] rounded-lg px-4 py-3 min-h-[140px] focus:outline-none focus:ring-1 focus:ring-[#FF7037]"
            value={modalState.reason}
            onChange={(e) =>
              setModalState((prev) => ({ ...prev, reason: e.target.value }))
            }
            placeholder="Admin's suggestion here"
            disabled={rejectLoading}
          />
          {!modalState.reason.trim() && (
            <div className="text-red-500 text-sm">Please provide a reason</div>
          )}
        </div>
      </Modal>

      {/* Main Layout */}
      <div className="md:hidden sticky top-0 z-30 h-[51px] md:h-full">
        <Sidebar horizontal />
      </div>
      <div className="flex flex-row w-full h-full bg-[#F6F6F9]">
        <div className="hidden md:flex h-full sticky top-0 z-30">
          <Sidebar />
        </div>
        <div className="bg-[#F6F6F9] flex flex-col px-10 pb-20 pt-10 gap-6 w-full h-full overflow-auto">
          {/* Header */}
          <div className="w-full flex flex-col md:flex-col lg:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col w-full gap-4">
              <div className="flex items-center gap-[10px] flex-row">
                <button
                  onClick={() => window.history.back()}
                  className="text-[#7B7E8F] text-[18px] font-bold flex items-center cursor-pointer"
                >
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block"
                  >
                    <path
                      d="M15 19l-7-7 7-7"
                      stroke="#232360"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="w-full gap-2 sm:gap-6 flex flex-col sm:flex-row items-start sm:items-center">
                  <span className="text-[24px] font-bold text-black whitespace-nowrap">
                    {sitter.users.name}
                  </span>
                  <span className="text-[16px] flex items-center gap-[8px] whitespace-nowrap">
                    <span
                      className={`inline-block w-[6px] h-[6px] rounded-full ${statusInfo.dot}`}
                    ></span>
                    <span
                      className={`text-[16px] font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </span>
                </div>
              </div>

              {/* Show reject reason if rejected */}
              {status === "rejected" && sitter.pet_sitter.admin_suggestion && (
                <div className="bg-[#DCDFED] text-[#EA1010] p-3 rounded-lg flex items-center gap-[10px]">
                  <Image
                    src={exclamation}
                    alt="exclamation"
                    width={20}
                    height={20}
                    className="text-[#EA1010] flex-shrink-0"
                  />
                  <span>
                    This request has not been approved: &lsquo;
                    {sitter.pet_sitter.admin_suggestion}&rsquo;
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons - only for waiting status */}
            {status === "waiting for approval" && (
              <div className="flex flex-col w-full lg:w-fit justify-center lg:justify-end md:self-center lg:self-start lg:flex-row gap-3">
                <ButtonOrangeLight
                  text={rejectLoading ? "Rejecting..." : "Reject"}
                  onClick={handleReject}
                  disabled={rejectLoading || approveLoading}
                />
                <ButtonOrange
                  text={approveLoading ? "Approving..." : "Approve"}
                  onClick={handleApprove}
                  disabled={approveLoading || rejectLoading}
                />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div>
            <div className="w-full mx-auto flex flex-col md:flex-row flex-wrap md:justify-start gap-0 md:gap-4">
              <TabButton
                isActive={activeTab === "profile"}
                label="Profile"
                onClick={() => setActiveTab("profile")}
              />
              <TabButton
                isActive={activeTab === "booking"}
                label="Booking"
                onClick={() => setActiveTab("booking")}
              />
              <TabButton
                isActive={activeTab === "reviews"}
                label="Reviews"
                onClick={() => setActiveTab("reviews")}
              />
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && <ProfileTab sitter={sitter} />}
            {activeTab === "booking" && (
              <BookingTab
                bookings={bookings}
                bookingsLoading={bookingsLoading}
              />
            )}
            {activeTab === "reviews" && <ReviewsTab sitterId={userId} />}
          </div>
        </div>
      </div>
    </>
  );
}
