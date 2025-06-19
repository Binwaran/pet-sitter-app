import React from "react";
import { Field } from "formik";
import Image from "next/image";
import exclamationcircle from "/public/assets/profile/exclamation-circle.svg";

export default function FormTextArea({
  label,
  name,
  touched,
  errors,
  ...props
}) {
  const hasError = touched[name] && errors[name];

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="text-[16px] font-medium">
        {label}
      </label>
      <div className="relative">
        <Field
          as="textarea"
          id={name}
          name={name}
          className={`w-full min-h-[140px] border border-[#DCDFED] rounded-lg pl-3 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
            hasError ? "pr-10 border-red-500" : ""
          }`}
          {...props}
        />
        {hasError && (
          <span className="absolute right-3 top-3">
            <Image src={exclamationcircle} alt="error" width={13} height={13} />
          </span>
        )}
      </div>
      {hasError && <div className="text-red-500 text-xs">{errors[name]}</div>}
    </div>
  );
}
