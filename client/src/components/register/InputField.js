import React from "react";

const InputFieldComponent = ({ label, name, type, value, onChange, error, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`mt-1 w-full border p-3 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition
        ${error ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-orange-500"}`}
      autoComplete="off"
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);
const InputField = React.memo(InputFieldComponent);

export default InputField;