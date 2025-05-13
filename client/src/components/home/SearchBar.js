"use client";

import RatingStars from "./rating.js";
import Checkbox from "./checkbox.js";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const router = useRouter();
  const [experience, setExperience] = useState("");

  return (
    <div className="w-full max-w-[1064px] px-4 pb-4 lg:px-0">
      <div className="bg-[#F6F6F9] md:px-6 px-4 w-full flex flex-col sm:flex-row sm:items-center sm:h-[72px] text-[var(--primary-gray-color-500)] rounded-t-3xl">
        <div className="text-[var(--primary-gray-color-500)] font-bold pt-4 pb-2 pr-3 sm:pt-0 sm:pb-0 w-[100px]">
          Pet Type:
        </div>
        <Checkbox />
      </div>

      <div className="flex-col lg:flex-row gap-6 bg-white w-full lg:h-[72px] flex lg:px-6 px-4 py-4 text-[var(--primary-gray-color-500)] font-bold rounded-b-3xl justify-between"
      style={{ boxShadow: "4px 4px 24px 0px #0000000A" }}>
        <div className="flex flex-col lg:flex-row lg:items-center">
          <p className="lg:pr-6 pb-3">Rating:</p>
          <RatingStars />
        </div>

        <div className="w-full lg:w-auto flex flex-col lg:flex-row lg:items-center lg:gap-3">
          <p className="pb-3 lg:pb-0">Experience:</p>
          <div className="relative w-full">
            <select
              name="experience"
              id="experience"
              value={experience}
              onChange={(e) => {
                setExperience(e.target.value);
              }}
              className="appearance-none pl-4 pr-8 border rounded-lg h-[48px] w-full outline-none ring-0 border-[#DCDFED] text-[#7B7E8F] font-normal text-[16px] flex items-center justify-center"
            >
              <option disabled value="">
                Select
              </option>
              <option value="0-2 Years">0-2 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="5%2B Years">5+ Years</option>
            </select>
            {/* custom dropdown arrow */}
            <span className="text-xs pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA1B9]">
            ⏷
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push("/pet-sitters")}
          className="w-full md:w-[80%] lg:w-[120px] bg-[var(--primary-orange-color-500)] text-white text-[16px] font-bold rounded-full tracking-wide h-[48px] self-center"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
