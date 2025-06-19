"use client";
import dayjs from "dayjs";

export default function CalendarHeader({ currentDate, viewType, onNavigate }) {
  const start = dayjs(currentDate);
  const end = start.add(6, "day");
  const formattedDateRange = `${start.format("MMM D")} – ${end.format(
    "D, YYYY"
  )}`;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center w-full gap-4 lg:gap-16">
      <div className="flex flex-col lg:flex-row items-center gap-6 w-full">
        <button className="bg-[#FFF1EC] text-[#FF7037] rounded-full px-6 py-3 font-bold min-w-30 gap-2 leading-[150%]">
          Today
        </button>
        <div className="flex items-center gap-6 whitespace-nowrap">
          <img
            src="/assets/arrowl.svg"
            className="w-5 h-5 cursor-pointer"
            onClick={() => onNavigate("prev")}
          />
          <span className="text-sm font-medium text-[#3A3B46] text-center leading-6">
            {formattedDateRange}
          </span>
          <img
            src="/assets/arrowr.svg"
            className="w-5 h-5 cursor-pointer"
            onClick={() => onNavigate("next")}
          />
        </div>
      </div>

      {/* ขวา */}
      <div className="flex items-start lg:items-center justify-center w-full lg:gap-4 lg:whitespace-nowrap">
        <Legend label="Available" color="border border-[#AEB1C3]" />
        <Legend
          label="Waiting for Confirm"
          color="border-2 border-[#FA8AC0] bg-pink-[#FFF0F1]"
        />
        <Legend label="Booked" color="border-2 border-[#FF7037] bg-[#FFF1EC]" />
        <Legend label="Success" color="bg-[#E7FDF4]" />
      </div>
    </div>
  );
}

function Legend({ label, color }) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-3 text-sm text-[#3A3B46] font-medium bg-white w-full">
      <div className={`w-6 h-6 flex ${color}`} />
      <span className="text-center text-[#3A3B46] leading-6">{label}</span>
    </div>
  );
}
