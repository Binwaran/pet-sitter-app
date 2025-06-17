"use client";
import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Tag from "@/components/pet-sitters/tag";

const SitterCard = ({ sitter, pet_sitter, isSelected, onClick }) => {
  const data = sitter || pet_sitter;
  const router = useRouter();

  const handleCardClick = () => {
    if (data?.user_id) {
      if (onClick) {
        onClick();
      }
      router.push(`/pet-sitters/${data.user_id}`);
    } else {
      console.warn("Cannot navigate: Sitter data or ID is missing for this card.");
    }
  };

  if (!data) {
    return (
      <div
        className="flex flex-col md:flex-row gap-4 p-4 bg-gray-100 rounded-xl shadow-sm relative text-center items-center justify-center"
        style={{ minWidth: "250px", minHeight: "160px" }}
      >
        <p className="text-gray-500">
          ข้อมูล Sitter ไม่พร้อมใช้งาน (Fallback Placeholder)
        </p>
      </div>
    );
  }

  let displayImageUrl = data.gallery_image_url
    ? Array.isArray(data.gallery_image_url)
      ? data.gallery_image_url[0]
      : data.gallery_image_url.split(",")[0]
    : data.imageUrl;
  if (
    !displayImageUrl ||
    typeof displayImageUrl !== "string" ||
    displayImageUrl.trim() === ""
  ) {
    displayImageUrl = "/assets/placeholder-image.jpg";
  }

  return (
    <div
      className={`flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer relative ${
        isSelected ? "border-2 border-orange-500" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* รูปภาพร้าน */}
      <div className="relative w-full h-48 md:w-40 md:h-32 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={displayImageUrl}
          alt={`ภาพร้านของ ${
            data?.trade_name || data?.name || "ไม่ระบุชื่อร้าน"
          }`}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 160px"
          priority
        />
      </div>

      {/* ดาว */}
      <div className="absolute right-2 md:top-2 md:right-2 bottom-30 md:bottom-30 flex items-center gap-1">
        {[...Array(Math.floor(data?.average_rating || 0))].map((_, index) => (
          <img
            key={index}
            src="/assets/star-rating.svg"
            alt="Star"
            className="w-4 h-4"
          />
        ))}
      </div>

      {/* ข้อมูล */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center">
            {/* รูปโปรไฟล์ */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-2">
              <Image
                src={
                  data?.users?.profile_image_url ||
                  "/assets/placeholder-profile.jpg"
                }
                alt={data?.users?.name || "Profile Image"}
                fill
                style={{ objectFit: "cover" }}
                sizes="40px"
              />
            </div>
            {/* ชื่อร้านและผู้ให้บริการ */}
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                {data?.trade_name || data?.name || "ชื่อร้านยังไม่ระบุ"}
              </h2>
              <p className="text-sm text-gray-500">
                By {data?.users?.name || "ไม่ระบุชื่อ"}
              </p>
            </div>
          </div>
        </div>
        {/* ที่อยู่ */}
        {data?.province && (
          <div className="mt-2 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-gray-500 text-sm"
            />
            <p className="text-sm text-gray-600">
              {data?.district || "ไม่ระบุเขต/อำเภอ"}
            </p>
          </div>
        )}
        {/* Tags */}
        {Array.isArray(data?.pet_type) && data.pet_type.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {data.pet_type.map((type) => (
              <Tag key={type} type={type} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SitterCard;
