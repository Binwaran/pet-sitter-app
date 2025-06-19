"use client";
import React from "react";

export default function ResolvePopup({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-neutral-700 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md flex flex-col space-y-6">
        {/* Header ที่มี Title กับ ปุ่ม X */}
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Resolve Report</h2>
            <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
            >
            ×
            </button>
        </div>

        {/* เส้นคั่น */}
        <hr className="border-t border-gray-200" />

        {/* คำถาม */}
        <p className="text-gray-600">Has this report already been resolved?</p>

        {/* ปุ่ม Cancel กับ Resolved */}
        <div className="flex justify-between gap-4">
            <button
            onClick={onCancel}
            className="bg-orange-100 text-orange-500 px-6 py-4 rounded-full hover:text-orange-700 cursor-pointer"
            >
            Cancel
            </button>
            <button
            onClick={onConfirm}
            className="bg-orange-500 text-white px-6 py-4 rounded-full hover:bg-orange-600 cursor-pointer"
            >
            Resolved
            </button>
        </div>
        </div>

    </div>
  );
}
