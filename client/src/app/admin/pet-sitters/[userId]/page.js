"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/admin/SidebarAdmin";
import {
  ButtonOrange,
  ButtonOrangeLight,
} from "@/components/buttons/OrangeButtons";

export default function AdminPetSitterDetailPage() {
  const { userId } = useParams();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSitter = async () => {
      try {
        const res = await axios.get(`/api/admin/pet-sitters/${userId}`);
        setSitter(res.data.data);
      } catch (err) {
        setSitter(null);
      }
      setLoading(false);
    };
    if (userId) fetchSitter();
  }, [userId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!sitter) return <div className="p-8">Not found</div>;

  // แปลงข้อมูล array จาก string ถ้าจำเป็น
  const petTypes = sitter.pet_sitter.pet_type
    ? Array.isArray(sitter.pet_sitter.pet_type)
      ? sitter.pet_sitter.pet_type
      : sitter.pet_sitter.pet_type.split(",").map((t) => t.trim())
    : [];
  const galleryImages = sitter.pet_sitter.gallery_image_url
    ? Array.isArray(sitter.pet_sitter.gallery_image_url)
      ? sitter.pet_sitter.gallery_image_url
      : sitter.pet_sitter.gallery_image_url.split(",").map((t) => t.trim())
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F7FA]">
      {/* Sidebar: Responsive */}
      <div className="md:hidden sticky top-0 z-30">
        <Sidebar horizontal />
      </div>
      <div className="flex flex-1 w-full">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col items-center w-full">
          {/* Header */}
          <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pt-8 pb-0 px-4 md:px-12 gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button className="mr-2 text-[#232360] text-[18px] font-bold hover:underline flex items-center">
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block mr-1"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    stroke="#232360"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* กลับหน้าก่อน */}
              </button>
              <span className="text-[20px] font-bold text-[#232360]">
                {sitter.users.name}
              </span>
              <span className="ml-3 text-[15px] font-medium flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-[#FA8AC0]"></span>
                <span className="text-[#FA8AC0]">Waiting for approve</span>
              </span>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <ButtonOrangeLight text="Reject" onClick={() => {}} />
              <ButtonOrange text="Approve" onClick={() => {}} />
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full max-w-[1200px] mx-auto flex gap-0 px-4 md:px-12 mt-2 border-b border-[#E4E4E7]">
            <button className="py-4 px-4 md:px-8 border-b-4 border-[#FF7037] text-[#232360] font-semibold text-[18px] bg-white rounded-t-xl shadow-sm">
              Profile
            </button>
            <button className="py-4 px-4 md:px-8 text-[#AEB1C3] font-semibold text-[18px] bg-transparent hover:text-[#232360]">
              Booking
            </button>
            <button className="py-4 px-4 md:px-8 text-[#AEB1C3] font-semibold text-[18px] bg-transparent hover:text-[#232360]">
              Reviews
            </button>
          </div>

          {/* Profile Content */}
          <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 md:gap-10 px-4 md:px-12 py-8 md:py-10">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4 min-w-[180px] md:min-w-[220px] lg:min-w-[260px] mb-6 lg:mb-0">
              <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] lg:w-[240px] lg:h-[240px] rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                <img
                  src={
                    sitter.users.profile_image_url ||
                    "/assets/sidebar/profile.svg"
                  }
                  alt={sitter.users.name}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: "999px" }}
                />
              </div>
            </div>
            {/* Info: การ์ดเดียว */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm flex flex-col gap-0">
                <div className="mb-7">
                  <div className="text-[#AEB1C3] font-semibold text-[20px] md:text-[22px] mb-1">
                    Full Name
                  </div>
                  <div className="text-[16px] md:text-[18px] text-[#232360]">
                    {sitter.users.name}
                  </div>
                </div>
                <div className="mb-7">
                  <div className="text-[#AEB1C3] font-semibold text-[20px] md:text-[22px] mb-1">
                    Experience
                  </div>
                  <div className="text-[16px] md:text-[18px] text-[#232360]">
                    {sitter.pet_sitter.experience} Years
                  </div>
                </div>
                <div className="mb-7">
                  <div className="text-[#AEB1C3] font-semibold text-[20px] md:text-[22px] mb-1">
                    Phone
                  </div>
                  <div className="text-[16px] md:text-[18px] text-[#232360]">
                    {sitter.users.phone}
                  </div>
                </div>
                <div className="mb-7">
                  <div className="text-[#AEB1C3] font-semibold text-[20px] md:text-[22px] mb-1">
                    ID Number
                  </div>
                  <div className="text-[16px] md:text-[18px] text-[#232360]">
                    {sitter.pet_sitter.id_number || "-"}
                  </div>
                </div>
                <div className="mb-7">
                  <div className="text-[#AEB1C3] font-semibold text-[20px] md:text-[22px] mb-1">
                    Date of Birth
                  </div>
                  <div className="text-[16px] md:text-[18px] text-[#232360]">
                    {sitter.users.birthday}
                  </div>
                </div>
                <div>
                  <div className="text-[#AEB1C3] font-semibold text-[20px] md:text-[22px] mb-1">
                    Introduction
                  </div>
                  <div className="text-[15px] md:text-[16px] text-[#232360] leading-relaxed">
                    {sitter.pet_sitter.introduction}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pet Sitter Info */}
          <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8 px-4 md:px-12 pb-10">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-4">
                <div className="text-[#AEB1C3] font-semibold text-[16px] md:text-[18px] mb-2">
                  Pet sitter name (Trade Name)
                </div>
                <div className="text-[16px] md:text-[18px] text-[#232360]">
                  {sitter.pet_sitter.trade_name}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-[#AEB1C3] font-semibold text-[16px] md:text-[18px] mb-2">
                  Pet type
                </div>
                <div className="flex gap-2 md:gap-3 flex-wrap">
                  {petTypes.map((type) => (
                    <span
                      key={type}
                      className={`px-3 md:px-4 py-1 rounded-full border text-[15px] md:text-[16px] font-semibold
                      ${
                        type === "Dog"
                          ? "border-[#1CCD83] text-[#1CCD83] bg-[#E7FDF4]"
                          : ""
                      }
                      ${
                        type === "Cat"
                          ? "border-[#FA8AC0] text-[#FA8AC0] bg-[#FFF0F1]"
                          : ""
                      }
                      ${
                        type === "Rabbit"
                          ? "border-[#FF986F] text-[#FF986F] bg-[#FFF5EC]"
                          : ""
                      }
                      ${
                        type === "Bird"
                          ? "border-[#76D0FC] text-[#76D0FC] bg-[#ECFBFF]"
                          : ""
                      }
                      ${
                        type === "Mouse"
                          ? "border-[#F9C846] text-[#F9C846] bg-[#FFF9E3]"
                          : ""
                      }
                      ${
                        type === "Turtle"
                          ? "border-[#A084E8] text-[#A084E8] bg-[#F3F0FF]"
                          : ""
                      }
                      ${
                        type === "Snake"
                          ? "border-[#FF5B5B] text-[#FF5B5B] bg-[#FFECEC]"
                          : ""
                      }
                    `}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-[#AEB1C3] font-semibold text-[16px] md:text-[18px] mb-2">
                  Services
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360] leading-relaxed whitespace-pre-line">
                  {sitter.pet_sitter.services}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-[#AEB1C3] font-semibold text-[16px] md:text-[18px] mb-2">
                  My Place
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360] leading-relaxed">
                  {sitter.pet_sitter.my_place}
                </div>
              </div>
              <div>
                <div className="text-[#AEB1C3] font-semibold text-[16px] md:text-[18px] mb-2">
                  Image Gallery
                </div>
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
                  {galleryImages.length > 0 ? (
                    galleryImages
                      .slice(0, 10)
                      .map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`gallery-${idx}`}
                          className="w-[140px] h-[90px] md:w-[180px] md:h-[120px] object-cover rounded-lg bg-gray-100"
                        />
                      ))
                  ) : (
                    <span className="text-gray-400">No images</span>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-2 text-[#AEB1C3] font-semibold text-[16px] md:text-[18px]">
                Address
              </div>
              <div className="mb-6 text-[15px] md:text-[16px] text-[#232360] leading-relaxed">
                {[
                  sitter.pet_sitter.house_number,
                  sitter.pet_sitter.village,
                  sitter.pet_sitter.sub_district,
                  sitter.pet_sitter.district,
                  sitter.pet_sitter.province,
                  sitter.pet_sitter.post_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <div className="w-full h-[180px] md:h-[260px] bg-[#F7F7FA] rounded-xl flex items-center justify-center border border-[#E4E4E7] overflow-hidden">
                <img
                  src="/mock/map.png"
                  alt="map"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
