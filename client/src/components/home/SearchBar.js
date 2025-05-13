"use client";

import RatingStars from "./rating.js";
import Checkbox from "./checkbox.js";
import { useRouter } from "next/navigation";
import ExperienceDropdown from "../dropdown/ExperienceDropdown.js";
import { useState } from "react";

const SearchBar = () => {
  const router = useRouter();
  const [experience, setExperience] = useState("");

  const handleExperienceChange = (value) => {
    setExperience(value);
  };

  return (
    <div className="w-full max-w-[1064px] px-4 pb-4 lg:px-4">
      <div className="bg-[#F6F6F9] md:px-6 px-4 w-full flex flex-col sm:flex-row sm:items-center sm:h-[72px] text-[var(--primary-gray-color-500)] rounded-t-3xl">
        <div className="text-[var(--primary-gray-color-500)] font-bold pt-4 pb-2 pr-3 sm:pt-0 sm:pb-0 w-[100px]">
          Pet Type:
        </div>
        <Checkbox />
      </div>

      <div
        className="flex-col lg:flex-row gap-6 bg-white w-full lg:h-[72px] flex lg:px-4 px-4 py-4 text-[var(--primary-gray-color-500)] rounded-b-3xl justify-between"
        style={{ boxShadow: "4px 4px 24px 0px #0000000A" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center">
          <p className="lg:pr-6 pb-3 font-bold">Rating:</p>
          <RatingStars />
        </div>

        <div className="w-full lg:w-auto flex flex-col lg:flex-row lg:items-center lg:gap-3">
          <p className="pb-3 lg:pb-0 font-bold">Experience:</p>
          <ExperienceDropdown
            value={experience}
            onChange={handleExperienceChange}
            className="input border-[#DCDFED]"
          />
        </div>

        <button
          onClick={() => router.push("/sitters")}
          className="w-full md:w-[80%] lg:w-[120px] bg-[var(--primary-orange-color-500)] text-white text-[16px] font-bold rounded-full tracking-wide h-[48px] self-center"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
