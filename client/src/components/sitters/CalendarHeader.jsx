'use client'

import Image from 'next/image'
import dayjs from 'dayjs'

export default function CalendarHeader({ currentDate, viewType, onNavigate }) {
  const start = dayjs(currentDate);
  const end = start.add(6, 'day');
  const formattedDateRange = `${start.format('MMM D')} – ${end.format('D, YYYY')}`;

  return (
    <div className="flex justify-between items-center mx-auto my-10">
      <div className="flex items-center gap-4">
        <button className="bg-orange-100 text-orange-500 rounded-full px-8 py-4 font-medium">
          Today
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/assets/arrow1.png"
            className="w-10 h-10 cursor-pointer"
            onClick={() => onNavigate('prev')}
          />
          <span className="text-lg font-semibold text-gray-800">{formattedDateRange}</span>
          <img
            src="/assets/arrow2.png"
            className="w-10 h-10 cursor-pointer"
            onClick={() => onNavigate('next')}
          />
        </div>
      </div>

      {/* ขวา */}
      <div className="flex gap-2">
        <Legend label="Available" color="border-gray-300 border" />
        <Legend label="Waiting for Confirm" color="border border-pink-400 bg-pink-200" />
        <Legend label="Booked" color="border border-orange-500 bg-orange-200" />
        <Legend label="Success" color="bg-green-200" />
      </div>
    </div>
  );
}

function Legend({ label, color }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-800 font-medium text-lg bg-white">
      <div className={`w-8 h-8 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}
