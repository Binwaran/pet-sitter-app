"use client";

import { useRef, useEffect, useState } from "react";

const experienceOptions = [
  { label: "0-2 Years", value: "0-2" },
  { label: "3-5 Years", value: "3-5" },
  { label: "5+ Years", value: "5+" },
];

const ExperienceDropdown = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option); // ใช้ onChange จาก props
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-w-[144px] flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] text-left ${className}`}
      >
        {experienceOptions.find((opt) => opt.value === value)?.label || (
          <span className="text-[#7B7E8F]">0-2 Years</span>
        )}
        <span className="text-xs text-[#9AA1B9]">⏷</span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[240px] overflow-auto">
          {experienceOptions.map((option, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(option.value)}
              className="px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] text-[#344054]"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExperienceDropdown;
