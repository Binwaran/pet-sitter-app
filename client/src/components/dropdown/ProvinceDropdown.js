"use client";
import { useState, useRef, useEffect } from "react";
import provinces from "../../app/data/provinces.json";

const ProvinceDropdown = ({ id, value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const selectedProvince = provinces.find(
    (province) => province.provinceCode === value
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
      id={id}
      type="button"
      tabIndex={0}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-labelledby={id ? `${id}-label` : undefined}
      onClick={() => setIsOpen((prev) => !prev)}
      className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${className}`}
    >
        <span
          className={selectedProvince ? "text-[#344054]" : "text-[#7B7E8F]"}
        >
          {selectedProvince
            ? selectedProvince.provinceNameEn
            : "Select Province"}
        </span>
        <span className="text-xs text-[#9AA1B9]">⏷</span>
      </button>
      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[280px] overflow-auto">
          {provinces.map((province) => (
            <li
              key={province.provinceCode}
              onClick={() => {
                onChange(province.provinceCode);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] ${
                value === province.provinceCode
                  ? "bg-[#FEF3ED] text-[#FEA267] font-semibold"
                  : ""
              }`}
            >
              {province.provinceNameEn}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProvinceDropdown;
