import React from "react";

const InputFieldComponent = ({ label, name, type, value, onChange, error, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="text-base font-medium text-black leading-[150%]">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full h-12 border px-4 py-3 rounded-lg text-base placeholder-[#7B7E8F] focus:outline-none focus:ring-2 transition
        ${error ? "border-red-500 focus:ring-red-500" : "border-[#DCDFED] focus:ring-orange-500"}`}
      autoComplete="off"
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);
const InputField = React.memo(InputFieldComponent);

export default InputField;