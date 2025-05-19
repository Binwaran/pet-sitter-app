"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/admin/SidebarAdmin";
import ProfileTab from "@/components/admin/pet-owners/ProfileTab";
import PetsTab from "@/components/admin/pet-owners/PetsTab";
import ReviewTab from "@/components/admin/pet-owners/ReviewsTab";

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

export default function AdminPetOwnerDetailPage() {
  const { userId } = useParams();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Memoized function to fetch pet owner data
  const fetchOwner = useCallback(async () => {
    try {
      console.log("🔍 Fetching pet owner data for userId:", userId);

      const response = await fetch(`/api/admin/pet-owners/${userId}`);
      const data = await response.json();

      console.log("📦 Pet owner API response:", data);

      if (data.success) {
        setOwner(data.data);
        console.log(
          "✅ Successfully fetched pet owner:",
          data.data.owner?.name
        );
      } else {
        console.error("❌ Failed to fetch pet owner:", data.message);
        setOwner(null);
      }
    } catch (err) {
      console.error("💥 Error fetching pet owner:", err);
      setOwner(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Effect to load data on mount or tab change
  useEffect(() => {
    if (userId) {
      fetchOwner();
    }
  }, [userId, activeTab, fetchOwner]);

  // Show loading state
  if (loading) {
    return (
      <EmptyLayout>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-3 border-[#FF7037] border-t-transparent rounded-full"></div>
          <span>Loading pet owner details...</span>
        </div>
      </EmptyLayout>
    );
  }

  // Show not found state
  if (!owner) {
    return (
      <EmptyLayout>
        <div className="flex flex-col items-center gap-4">
          <span>Pet owner not found</span>
        </div>
      </EmptyLayout>
    );
  }

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 h-[51px] md:h-full">
        <Sidebar horizontal />
      </div>
      <div className="flex flex-row w-full h-full bg-[#F6F6F9]">
        <div className="hidden md:flex h-full sticky top-0 z-30">
          <Sidebar />
        </div>
        <div className="bg-[#F6F6F9] flex flex-col px-5 md:px-10 pb-20 pt-10 gap-6 w-full h-full overflow-auto">
          {/* Header Section */}
          <div className="flex items-center justify-start gap-2.5 flex-row w-full">
            <button
              onClick={() => window.history.back()}
              className="flex items-center cursor-pointer"
            >
              <Image
                src="/assets/arrowl.svg"
                alt="Back"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>
            <span className="text-2xl leading-8 font-bold text-black">
              {owner.owner.name}
            </span>
          </div>

          {/* Tabs Section */}
          <div>
            <div className="w-full mx-auto flex flex-col md:flex-row flex-wrap md:justify-start gap-0 md:gap-4">
              <TabButton
                isActive={activeTab === "profile"}
                label="Profile"
                onClick={() => setActiveTab("profile")}
              />
              <TabButton
                isActive={activeTab === "pets"}
                label="Pets"
                onClick={() => setActiveTab("pets")}
              />
              <TabButton
                isActive={activeTab === "reviews"}
                label="Reviews"
                onClick={() => setActiveTab("reviews")}
              />
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && <ProfileTab owner={owner} />}
            {activeTab === "pets" && <PetsTab owner={owner} />}
            {activeTab === "reviews" && <ReviewTab owner={owner} />}
          </div>
        </div>
      </div>
    </>
  );
}
