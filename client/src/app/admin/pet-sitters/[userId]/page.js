"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/admin/SidebarAdmin";
import {
  ButtonOrange,
  ButtonOrangeLight,
} from "@/components/buttons/OrangeButtons";
import Modal from "@/components/Modal";
import ProfileTab from "@/components/admin/pet-sitters/ProfileTab";
import BookingTab from "@/components/admin/pet-sitters/BookingTab";
import ReviewsTab from "@/components/admin/pet-sitters/ReviewsTab";

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
import Image from "next/image";
import exclamation from "/public/assets/profile/exclamation-circle.svg";

export default function AdminPetSitterDetailPage() {
  const { userId } = useParams();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // ดึงข้อมูลล่าสุดจาก backend เสมอ
  const fetchSitter = async () => {
    try {
      setLoading(true);
      // เพิ่ม timestamp เพื่อป้องกัน cache
      const res = await axios.get(
        `/api/admin/pet-sitters/${userId}?t=${Date.now()}`
      );
      setSitter(res.data.data);
    } catch (err) {
      console.error("Failed to fetch sitter:", err);
      setSitter(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch bookings for the current pet sitter
  const fetchBookings = async () => {
    if (!sitter?.pet_sitter?.user_id) return;

    try {
      setBookingsLoading(true);
      const res = await axios.get(
        `/api/admin/bookings/${sitter.pet_sitter.user_id}`
      );
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Add this to your useEffect
  useEffect(() => {
    if (userId) {
      fetchSitter();
      if (activeTab === "booking") {
        fetchBookings();
      }
    }
  }, [userId, activeTab]);

  if (loading)
    return (
      <>
        <div className="md:hidden sticky top-0 z-30 h-[51px] md:h-full">
          <Sidebar horizontal />
        </div>
        <div className="flex flex-row w-full h-full bg-[#F6F6F9]">
          <div className="hidden md:flex h-full sticky top-0 z-30">
            <Sidebar />
          </div>
          <div className="bg-[#F6F6F9] w-full h-screen flex justify-center items-center">
            <div className="text-xl font-bold">Loading...</div>
          </div>
        </div>
      </>
    );

  if (!sitter)
    return (
      <>
        <div className="md:hidden sticky top-0 z-30 h-[51px] md:h-full">
          <Sidebar horizontal />
        </div>
        <div className="flex flex-row w-full h-full bg-[#F6F6F9]">
          <div className="hidden md:flex h-full sticky top-0 z-30">
            <Sidebar />
          </div>
          <div className="bg-[#F6F6F9] w-full h-screen flex justify-center items-center">
            <div className="text-xl font-bold">Not found</div>
          </div>
        </div>
      </>
    );

  // Approve Handler
  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to approve this pet sitter?"))
      return;

    setApproveLoading(true);
    try {
      // แปลง userId ให้เป็น string เสมอ
      console.log("userId type:", typeof userId, "value:", userId);
      const userIdString = String(userId);
      console.log("userIdString:", userIdString);

      const response = await axios.post(`/api/admin/pet-sitters/approve`, {
        userId: userIdString,
      });

      if (response.data.success) {
        // อัพเดต UI ทันที
        setSitter((prev) => ({
          ...prev,
          pet_sitter: {
            ...prev.pet_sitter,
            status: "approved",
            admin_suggestion: null,
          },
        }));

        window.alert("Approved successfully");

        // แทนที่จะดึงข้อมูลใหม่ ให้ใช้ข้อมูลจาก API response
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
      console.error("Approve error:", err);
      console.error("Error response:", err.response?.data);
      window.alert(err?.response?.data?.message || "Approve failed");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  // เพิ่มฟังก์ชัน handleReject เพื่อเปิด modal
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) return;

    setRejectLoading(true);
    try {
      // แปลง userId ให้เป็น string เสมอ
      console.log("userId type:", typeof userId, "value:", userId);
      const userIdString = String(userId);
      console.log("userIdString:", userIdString);

      const response = await axios.post(`/api/admin/pet-sitters/reject`, {
        userId: userIdString,
        reason: rejectReason,
      });

      if (response.data.success) {
        // อัพเดต UI ทันที
        setSitter((prev) => ({
          ...prev,
          pet_sitter: {
            ...prev.pet_sitter,
            status: "rejected",
            admin_suggestion: rejectReason,
          },
        }));

        setShowRejectModal(false);
        setRejectReason("");
        window.alert("Rejected successfully");

        // แทนที่จะดึงข้อมูลใหม่ ให้ใช้ข้อมูลจาก API response
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
      console.error("Reject error:", err);
      console.error("Error response:", err.response?.data);
      window.alert(err?.response?.data?.message || "Reject failed");
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <>
      {/* Modal สำหรับ Reject */}
      <Modal
        open={showRejectModal}
        title="Reject Confirmation"
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        onConfirm={handleConfirmReject}
        confirmText="Reject"
        cancelText="Cancel"
        disabled={!rejectReason.trim() || rejectLoading}
        maxWidthClass="md:max-w-[600px]"
      >
        <div className="flex flex-col gap-1">
          <label className="font-medium leading-[150%]">
            Reason and suggestion
          </label>
          <textarea
            className="flex gap-2 w-full border border-[#DCDFED] rounded-lg px-4 py-3 min-h-[140px] focus:outline-none focus:ring-1 focus:ring-[#FF7037]"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Admin's suggestion here"
            disabled={rejectLoading}
          />
          {!rejectReason.trim() && (
            <div className="text-red-500 text-sm">Please provide a reason</div>
          )}
        </div>
      </Modal>

      {/* Sidebar: Responsive */}
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
                  className="text-[#7B7E8F] text-[18px] font-bold hover:underline flex items-center cursor-pointer"
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
                      className={`inline-block w-[6px] h-[6px] rounded-full ${
                        STATUS_MAP[sitter.pet_sitter.status]?.dot ||
                        "bg-gray-400"
                      }`}
                    ></span>
                    <span
                      className={`text-[16px] font-medium ${
                        STATUS_MAP[sitter.pet_sitter.status]?.color ||
                        "text-gray-400"
                      }`}
                    >
                      {STATUS_MAP[sitter.pet_sitter.status]?.text || "Unknown"}
                    </span>
                  </span>
                </div>
              </div>
              {/* Show reject reason if rejected */}
              {sitter.pet_sitter.status === "rejected" &&
                sitter.pet_sitter.admin_suggestion && (
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

            {/* ย้าย conditional rendering มาครอบ div ทั้งหมด */}
            {sitter.pet_sitter.status === "waiting for approval" && (
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
          <div>
            {/* Tabs */}
            <div className="w-full mx-auto flex flex-col md:flex-row flex-wrap md:justify-start gap-0 md:gap-4">
              <button
                className={`min-w-[100px] py-3 px-4 md:px-8 font-semibold text-[16px] md:text-[20px] rounded-t-xl transition cursor-pointer
                ${
                  activeTab === "profile"
                    ? "text-[#FF7037] bg-white"
                    : "text-[#AEB1C3] bg-[#DCDFED] hover:text-[#FF7037]"
                }
              `}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`min-w-[100px] py-3 px-4 md:px-8 font-semibold text-[16px] md:text-[20px] md:rounded-t-xl transition cursor-pointer
                ${
                  activeTab === "booking"
                    ? "text-[#FF7037] bg-white"
                    : "text-[#AEB1C3] bg-[#DCDFED] hover:text-[#FF7037]"
                }
              `}
                onClick={() => setActiveTab("booking")}
              >
                Booking
              </button>
              <button
                className={`min-w-[100px] py-3 px-4 md:px-8 font-semibold text-[16px] md:text-[20px] md:rounded-t-xl transition cursor-pointer
                ${
                  activeTab === "reviews"
                    ? "text-[#FF7037] bg-white"
                    : "text-[#AEB1C3] bg-[#DCDFED] hover:text-[#FF7037]"
                }
              `}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
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
