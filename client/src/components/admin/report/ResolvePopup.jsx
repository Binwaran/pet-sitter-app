"use client";
import React from "react";

export default function ResolvePopup({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-neutral-600 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">Resolve Report</h2>
        <hr className="my-4 border-t border-gray-200" />
        <p className="mb-4">Has this report already been resolved?</p>
        <div className="flex justify-between gap-4">
          <button onClick={onCancel} className="bg-orange-100 text-orange-500 px-6 py-4 rounded-full hover:font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-orange-500 text-white px-6 py-4 rounded-full hover:font-semibold">
            Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
