import React from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  disabled,
  maxWidthClass = "md:max-w-full",
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className={`bg-white rounded-2xl w-3/5 md:w-full ${maxWidthClass}`}
        style={{ boxShadow: "4px 4px 24px 0px #0000000A" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E6ED]">
          <h2 className="text-xl font-bold leading-7">{title}</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <svg width="24" height="24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col p-6 gap-3 md:gap-6">
          {children}
          <div className="flex flex-col md:flex-row gap-3 md:justify-between w-full">
            <button
              className="flex justify-center items-center py-3 px-6 bg-[var(--primary-orange-color-100)] text-[var(--primary-orange-color-500)] hover:text-[#FF986F] active:text-[#E44A0C] rounded-[99px] min-w-[120px] text-base font-bold text-nowrap hover:scale-105 hover:bg-[#FFD5C2] focus:scale-100 transition-transform"
              onClick={onClose}
              type="button"
            >
              {cancelText}
            </button>
            <button
              className={`flex justify-center items-center py-3 px-6 bg-[var(--primary-orange-color-500)] text-white hover:bg-[#FF986F] active:bg-[#E44A0C] rounded-[99px] min-w-[120px] text-base font-bold text-nowrap hover:scale-105 focus:scale-100 transition-transform ${
                disabled ? "bg-[#AEB1C3] hover:scale-100" : ""
              }`}
              onClick={onConfirm}
              type="button"
              disabled={disabled}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
