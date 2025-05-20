"use client";

import { useRef, useEffect, useState } from "react";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Waiting for approve", value: "waiting for approval" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const StatusDropdown = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option);
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
    <div className="relative min-w-[160px] w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border border-[#E4E4E7] bg-white text-left text-[#344054] text-[16px] font-normal ${className}`}
      >
        {statusOptions.find((opt) => opt.value === value)?.label || "All status"}
        <span className="text-xs text-[#9AA1B9]">⏷</span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[240px] overflow-auto">
          {statusOptions.map((option, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(option.value)}
              className="px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] text-[#344054] text-[16px] font-normal"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StatusDropdown;
