import React from "react";
import { Field } from "formik";
import Image from "next/image";
import ExperienceDropdown from "@/components/dropdown/ExperienceDropdown";
import PetTypeMultiSelect from "@/components/dropdown/PetTypeMultiSelect";
import exclamationcircle from "/public/assets/profile/exclamation-circle.svg";

export default function FormField({
  label,
  name,
  type = "text",
  component,
  touched,
  errors,
  autoComplete,
  onChange,
  value,
  ...props
}) {
  const hasError = touched[name] && errors[name];

  // Handle specialized components
  const renderField = () => {
    if (component === "ExperienceDropdown") {
      return (
        <ExperienceDropdown
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`input border-[#DCDFED] ${
            hasError ? "pr-10 border-red-500" : ""
          }`}
        />
      );
    }

    if (component === "PetTypeMultiSelect") {
      return (
        <PetTypeMultiSelect
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={hasError ? "border-red-500" : ""}
        />
      );
    }

    // Default text field
    return (
      <Field
        type={type}
        id={name}
        name={name}
        autoComplete={autoComplete}
        className={`input border-[#DCDFED] ${
          hasError ? "pr-10 border-red-500" : ""
        }`}
        {...props}
      />
    );
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="text-[16px] font-medium">
        {label}
      </label>
      <div className="relative">
        {renderField()}
        {hasError && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Image src={exclamationcircle} alt="error" width={13} height={13} />
          </span>
        )}
      </div>
      {hasError && <div className="text-red-500 text-xs">{errors[name]}</div>}
    </div>
  );
}
