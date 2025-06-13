'use client'
import React from 'react'
import Image from 'next/image'

export default function CalendarToolbar({ label, onNavigate, onView, filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex flex-row items-center gap-4">
                <button
                    onClick={() => onNavigate('TODAY')}
                    className="px-5 py-2 bg-orange-200 text-orange-500 text-lg rounded-full hover:bg-gray-100"
                >
                    Today
                </button>
            <div className="flex gap-2 items-center">
                <button
                onClick={() => onNavigate('PREV')}
                className="px-3 py-1 cursor-pointer"
                >
                <Image src="/assets/arrow1.png" alt="Previous" width={40} height={40} />
                </button>
                <span className="text-lg text-gray-700 font-thin">{label}</span>
                <button
                onClick={() => onNavigate('NEXT')}
                className="px-3 py-1 cursor-pointer"
                >
                <Image src="/assets/arrow2.png" alt="Next" width={40} height={40} />
                </button>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'waiting', 'booked', 'success'].map((status) => (
          <button
            key={status}
            onClick={() => setFilters(status)}
            className={`px-4 py-1 rounded-full border text-sm capitalize ${
              filters === status
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  )
}
