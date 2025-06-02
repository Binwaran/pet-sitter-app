"use client";
import { useState, useRef, useEffect } from "react";
import subdistricts from "../../app/data/subdistricts.json";

const SubdistrictDropdown = ({
  districtCode,
  id,
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ดึงค่า districtCode ทั้งกรณีเป็น object และ primitive
  const actualDistrictCode = districtCode?.value || districtCode;

  const filteredSubdistricts = subdistricts.filter(
    (subdistrict) => subdistrict.districtCode === parseInt(actualDistrictCode)
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

  // แก้ไขวิธีดึงค่า selectedSubdistrict
  const selectedSubdistrict =
    value && typeof value === "object"
      ? filteredSubdistricts.find(
          (subdistrict) =>
            String(subdistrict.subdistrictCode) === String(value.value)
        )
      : filteredSubdistricts.find(
          (subdistrict) => String(subdistrict.subdistrictCode) === String(value)
        );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        id={id}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between w-full pl-3 pr-4 py-3 border border-[#DCDFED] rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
          !actualDistrictCode ? "opacity-50 pointer-events-none" : ""
        } ${className}`}
      >
        <span
          className={selectedSubdistrict ? "text-[#344054]" : "text-[#7B7E8F]"}
        >
          {selectedSubdistrict
            ? selectedSubdistrict.subdistrictNameEn
            : "Select Subdistrict"}
        </span>
        <span className="text-xs text-[#9AA1B9]">⏷</span>
      </button>
      {isOpen && actualDistrictCode && (
        <ul
          role="listbox"
          className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[280px] overflow-auto"
        >
          {filteredSubdistricts.map((subdistrict) => (
            <li
              key={subdistrict.subdistrictCode}
              role="option"
              aria-selected={
                value?.value === subdistrict.subdistrictCode ||
                value === subdistrict.subdistrictCode
              }
              onClick={() => {
                onChange({
                  value: subdistrict.subdistrictCode,
                  label: subdistrict.subdistrictNameEn,
                  postalCode: subdistrict.postalCode,
                });
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] ${
                value?.value === subdistrict.subdistrictCode ||
                value === subdistrict.subdistrictCode
                  ? "bg-[#FEF3ED] text-[#FEA267] font-semibold"
                  : ""
              }`}
            >
              {subdistrict.subdistrictNameEn}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SubdistrictDropdown;
