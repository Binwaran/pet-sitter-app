"use client";
import { useState, useRef, useEffect } from "react";
import subdistricts from "../../app/data/subdistricts.json";

const SubdistrictDropdown = ({
  districtCode,
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredSubdistricts = subdistricts.filter(
    (subdistrict) => subdistrict.districtCode === parseInt(districtCode)
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

  const selectedSubdistrict = filteredSubdistricts.find(
    (subdistrict) => subdistrict.subdistrictCode === value
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        tabIndex={0}
        role="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between px-4 py-3 border border-[#DCDFED] rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
          !districtCode ? "opacity-50 pointer-events-none" : ""
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
      </div>
      {isOpen && districtCode && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[280px] overflow-auto">
          {filteredSubdistricts.length === 0 && (
            <li className="px-4 py-2 text-[#7B7E8F]">No subdistricts</li>
          )}
          {filteredSubdistricts.map((subdistrict) => (
            <li
              key={subdistrict.subdistrictCode}
              onClick={() => {
                onChange(subdistrict.subdistrictCode);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] ${
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
