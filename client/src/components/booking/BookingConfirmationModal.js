import React from 'react';

export default function BookingConfirmationModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xs p-6 relative flex flex-col items-center">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="font-bold text-lg mb-2 text-center">Booking Confirmation</h2>
        <hr className="w-full border-gray-200 mb-4" />
        <p className="text-gray-500 text-sm mb-6 text-center">Are you sure to booking this pet sitter?</p>
        <div className="flex w-full gap-3 justify-center">
          <button
            className="flex-1 px-4 py-2 rounded-full bg-[#FFF6F0] text-orange-500 font-medium hover:bg-orange-50 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
            onClick={onConfirm}
          >
            Yes, I'm sure
          </button>
        </div>
      </div>
    </div>
  );
}
