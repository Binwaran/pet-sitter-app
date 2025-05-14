"use client";
import { useState, useRef, useEffect } from "react";
import districts from "../../app/data/districts.json";

const DistrictDropdown = ({
  provinceCode,
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredDistricts = districts.filter(
    (district) => district.provinceCode === parseInt(provinceCode)
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

  const selectedDistrict = filteredDistricts.find(
    (district) => district.districtCode === value
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        tabIndex={0}
        role="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between px-4 py-3 border border-[#DCDFED] rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
          !provinceCode ? "opacity-50 pointer-events-none" : ""
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
      </div>
      {isOpen && provinceCode && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[280px] overflow-auto">
          {filteredDistricts.length === 0 && (
            <li className="px-4 py-2 text-[#7B7E8F]">No districts</li>
          )}
          {filteredDistricts.map((district) => (
            <li
              key={district.districtCode}
              onClick={() => {
                onChange(district.districtCode);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] ${
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
