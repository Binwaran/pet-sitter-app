import React from "react";
import { useFormikContext } from "formik";
import Image from "next/image";
import exclamationcircle from "/public/assets/profile/exclamation-circle.svg";
import ProvinceDropdown from "@/components/dropdown/ProvinceDropdown";
import DistrictDropdown from "@/components/dropdown/DistrictDropdown";
import SubdistrictDropdown from "@/components/dropdown/SubdistrictDropdown";

// Province Field Component
export function ProvinceField({ onChange }) {
  const { values, errors, touched } = useFormikContext();
  const hasError = touched.province && errors.province;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        id="province-label"
        htmlFor="province"
        className="text-[16px] font-medium"
      >
        Province*
      </label>
      <div className="relative">
        <ProvinceDropdown
          id="province"
          name="province"
          value={values.province}
          onChange={onChange}
          className={`${hasError ? "border-red-500" : "border-[#DCDFED]"}`}
        />
        {hasError && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2">
            <Image src={exclamationcircle} alt="error" width={13} height={13} />
          </span>
        )}
      </div>
      {hasError && (
        <div className="text-red-500 text-xs">{errors.province}</div>
      )}
    </div>
  );
}

// District Field Component
export function DistrictField({ provinceCode, onChange }) {
  const { values, errors, touched } = useFormikContext();
  const hasError = touched.district && errors.district;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        id="district-label"
        htmlFor="district"
        className="text-[16px] font-medium"
      >
        District*
      </label>
      <div className="relative">
        <DistrictDropdown
          id="district"
          name="district"
          provinceCode={provinceCode}
          value={values.district}
          onChange={onChange}
          className={`${hasError ? "border-red-500" : "border-[#DCDFED]"}`}
        />
        {hasError && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2">
            <Image src={exclamationcircle} alt="error" width={13} height={13} />
          </span>
        )}
      </div>
      {hasError && (
        <div className="text-red-500 text-xs">{errors.district}</div>
      )}
    </div>
  );
}

// Subdistrict Field Component
export function SubdistrictField({ districtCode, onChange }) {
  const { values, errors, touched } = useFormikContext();
  const hasError = touched.sub_district && errors.sub_district;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        id="sub_district-label"
        htmlFor="sub_district"
        className="text-[16px] font-medium"
      >
        Subdistrict*
      </label>
      <div className="relative">
        <SubdistrictDropdown
          id="sub_district"
          name="sub_district"
          districtCode={districtCode}
          value={values.sub_district}
          onChange={onChange}
          className={`${hasError ? "border-red-500" : "border-[#DCDFED]"}`}
        />
        {hasError && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2">
            <Image src={exclamationcircle} alt="error" width={13} height={13} />
          </span>
        )}
      </div>
      {hasError && (
        <div className="text-red-500 text-xs">{errors.sub_district}</div>
      )}
    </div>
  );
}
