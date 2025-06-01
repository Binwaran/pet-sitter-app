import { useState, useRef, useEffect } from "react";

const options = ["Cat", "Dog", "Bird", "Rabbit", "Mouse", "Turtle", "Snake"];

export default function PetTypeMultiSelect({
  id,
  value = [],
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (option) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleRemove = (option) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        id={id}
        type="button"
        tabIndex={0}
        role="combobox"
        aria-controls="pet-type-listbox"
        aria-expanded={open}
        aria-labelledby={id ? `${id}-label` : undefined}
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[48px] border border-[#DCDFED] rounded-lg pl-2 pr-4 py-2 flex flex-wrap justify-between items-center cursor-pointer bg-white"
      >
        {/* Container สำหรับ tags ที่เลือก */}
        <div className="flex flex-wrap flex-1 gap-2 items-center">
          {value.length === 0 && (
            <span className="text-[#7B7E8F]">Select pet type</span>
          )}
          {value.map((v) => (
            <span
              key={v}
              className="flex items-center justify-center w-auto h-[32px] leading-[24px] bg-[#FFF1EC] text-[#E44A0C] rounded-full pl-3 pr-2 text-[14px] gap-1 font-medium"
            >
              {v}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${v}`}
                className="text-[#E44A0C] hover:text-[#FF3B00] focus:outline-none cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRemove(v);
                  }
                }}
              >
                &times;
              </span>
            </span>
          ))}
        </div>

        {/* ลูกศรชี้ลงอยู่ทางขวาเสมอ */}
        <span className="flex text-[#9AA1B9] text-xs">⏷</span>
      </button>
      {open && (
        <ul
          id="pet-type-listbox"
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md"
        >
          {options.map((option) => (
            <li
              key={option}
              role="option"
              className={`px-4 py-2 cursor-pointer hover:bg-[#F9FAFB] ${
                value.includes(option)
                  ? "text-[#E44A0C] font-semibold"
                  : "text-[#344054]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
