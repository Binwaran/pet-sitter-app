'use client';

import React, { useEffect, useState } from "react";

export default function BookingDetailModal({ booking, onClose }) {
  const [isClient, setIsClient] = useState(false);

  // ✅ รอให้ mounted ฝั่ง client ก่อนค่อยใช้ document
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ ปิด scroll ด้านหลัง modal (เฉพาะเมื่อ client mount แล้ว)
  useEffect(() => {
    if (!isClient) return;
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`; // เพิ่ม padding เท่ากับความกว้างของ scrollbar

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = ""; // คืนค่า padding เมื่อปิด modal
    };
  }, [isClient]);

  if (!booking || !isClient) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-md relative p-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-6">Booking Detail</h1>
        <p className="text-pink-500 font-medium mb-4">• {booking.status}</p>
        <p className="text-sm text-gray-500 mb-1">
          Transaction date:{" "}
          {booking.created_at
            ? new Date(booking.created_at).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Transaction No. : {booking.transaction_no || "N/A"}
        </p>

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-1">
            Pet Sitter:
          </h2>
          <p>
            {booking.sitter_name}
            <span className="text-orange-500 cursor-pointer text-sm">
              {" "}
              📍 View Map
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-1">
              Date & Time:
            </h2>
            <p>
              {booking.date || "N/A"} | {booking.time || "N/A"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-1">
              Duration:
            </h2>
            <p>{booking.duration || "N/A"}</p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-1">Pet:</h2>
          <p>
            {Array.isArray(booking.pets)
              ? booking.pets.join(", ")
              : booking.pet_name || "N/A"}
          </p>
        </div>

        <div className="flex justify-between font-semibold text-lg border-t pt-4 border-gray-200">
          <span>Total</span>
          <span>{booking.total_price} THB</span>
        </div>
      </div>
    </div>
  );
}
