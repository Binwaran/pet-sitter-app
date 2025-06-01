"use client";
import { useState, useRef, useEffect } from "react";
import districts from "../../app/data/districts.json";

const DistrictDropdown = ({
  provinceCode,
  id,
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ดึงค่า provinceCode ทั้งกรณีเป็น object และ primitive
  const actualProvinceCode = provinceCode?.value || provinceCode;

  const filteredDistricts = districts.filter(
    (district) => district.provinceCode === parseInt(actualProvinceCode)
  );

  // ปิด dropdown เมื่อคลิกนอก component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // แก้ไขวิธีดึงค่า selectedDistrict
  const selectedDistrict =
    value && typeof value === "object"
      ? filteredDistricts.find(
          (district) => String(district.districtCode) === String(value.value)
        )
      : filteredDistricts.find(
          (district) => String(district.districtCode) === String(value)
        );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        id={id}
        tabIndex={0}
        role="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between w-full pl-3 pr-4 py-3 border border-[#DCDFED] rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
          !actualProvinceCode ? "opacity-50 pointer-events-none" : ""
        } ${className}`}
      >
        <span
          className={selectedDistrict ? "text-[#344054]" : "text-[#7B7E8F]"}
        >
          {selectedDistrict
            ? selectedDistrict.districtNameEn
            : "Select District"}
        </span>
        <span className="text-xs text-[#9AA1B9]">⏷</span>
      </button>
      {isOpen && actualProvinceCode && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[280px] overflow-auto">
          {filteredDistricts.map((district) => (
            <li
              key={district.districtCode}
              onClick={() => {
                onChange({
                  value: district.districtCode,
                  label: district.districtNameEn,
                });
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] ${
                value?.value === district.districtCode ||
                value === district.districtCode
                  ? "bg-[#FEF3ED] text-[#FEA267] font-semibold"
                  : ""
              }`}
            >
              {district.districtNameEn}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DistrictDropdown;
