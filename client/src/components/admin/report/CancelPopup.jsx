"use client";
import React from "react";

export default function CancelPopup({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-neutral-600 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">Cancel Report</h2>
        <p className="mb-4">Are you sure you want to cancel this report?</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="bg-gray-100 px-4 py-2 rounded hover:font-semibold">
            Back
          </button>
          <button onClick={onConfirm} className="bg-orange-500 text-white px-4 py-2 rounded hover:font-semibold">
            Cancel Report
          </button>
        </div>
      </div>
    </div>
  );
}