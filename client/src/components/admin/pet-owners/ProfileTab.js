"use client";

import { memo, useMemo } from "react";
import Image from "next/image";

// สร้าง component ย่อยเพื่อแสดงข้อมูลแต่ละ field
const InfoField = memo(({ label, value, children }) => (
  <div className="flex flex-col gap-1">
    <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
      {label}
    </div>
    <div className="text-[15px] md:text-[16px] leading-relaxed">
      {children || value || "N/A"}
    </div>
  </div>
));

InfoField.displayName = "InfoField";

const ProfileTab = memo(({ owner }) => {
  const ownerData = owner?.owner || {};

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch {
      return "N/A";
    }
  };

  // Format phone number 
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    // ลบอักขระที่ไม่ใช่ตัวเลข
    const cleanPhone = phone.replace(/\D/g, "");

    // ถ้าเป็นเบอร์ไทย (10 หลัก)
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    // ถ้าเป็นเบอร์ที่มี country code +66
    else if (cleanPhone.length === 11 && cleanPhone.startsWith("66")) {
      const localNumber = cleanPhone.substring(2);
      return localNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    // ถ้าเป็นเบอร์รูปแบบอื่น
    else if (cleanPhone.length >= 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d+)/, "$1 $2 $3");
    }

    return phone; // คืนค่าเดิมถ้า format ไม่ได้
  };

  return (
    <div className="w-full flex flex-col bg-white md:rounded-tr-2xl rounded-br-2xl rounded-bl-2xl gap-5 md:gap-10 p-5 md:p-10">
      <div className="w-full mx-auto flex flex-col lg:flex-row gap-10">
        <div className="flex flex-col items-center md:items-center gap-4 w-full h-full md:w-[240px]">
          <div className="w-[200px] md:w-[240px] h-[200px] md:h-[240px] rounded-full bg-gray-100 flex items-center justify-center">
            {ownerData.profile_image_url ? (
              <Image
                src={ownerData.profile_image_url}
                alt={ownerData.name || "Pet Owner"}
                width={240}
                height={240}
                className="w-full h-full object-cover overflow-hidden rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/profile/profileimg.svg";
                }}
              />
            ) : (
              <div className="w-[200px] md:w-[240px] h-[200px] md:h-[240px] flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="text-gray-400"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-[#FAFAFB] rounded-lg p-6 flex flex-col gap-10 w-full">
          <InfoField label="Full Name" value={ownerData.name} />
          <InfoField label="Email" value={ownerData.email} />
          <InfoField label="Phone" value={formatPhone(ownerData.phone)} />
          <InfoField
            label="Date of Birth"
            value={formatDate(ownerData.date_of_birth)}
          />
        </div>
      </div>
      <span className="flex items-center justify-end text-[#FF7037] font-bold leading-[150%]">
        Ban This User
      </span>
    </div>
  );
});

ProfileTab.displayName = "ProfileTab";

export default ProfileTab;
