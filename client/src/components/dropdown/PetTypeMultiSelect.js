import { useState, useRef, useEffect } from "react";

const options = ["Cat", "Dog", "Bird", "Rabbit"];

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
        role="combobox" // เปลี่ยนจาก listbox เป็น combobox
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={id ? `${id}-label` : undefined}
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[40px] sm:min-h-[48px] border border-[#DCDFED] rounded-lg px-2 py-2 flex flex-wrap items-center cursor-pointer bg-white"
      >
        {value.length === 0 && (
          <span className="text-[#7B7E8F]">Select pet type</span>
        )}
        {value.map((v) => (
          <span
            key={v}
            className="flex items-center justify-center w-auto h-[32px] leading-[24px] bg-[#FFF1EC] text-[#E44A0C] rounded-full px-2 md:px-4 py-2 text-[14px] font-medium mr-0 md:mr-1 lg:mr-2"
          >
            {v}
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remove ${v}`}
              className="ml-2 text-[#E44A0C] hover:text-[#FF3B00] focus:outline-none cursor-pointer"
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
        <span className="ml-auto text-[#9AA1B9] text-xs">⏷</span>
      </button>
      {open && (
        <ul
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
