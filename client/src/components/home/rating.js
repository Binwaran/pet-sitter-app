import Image from "next/image";
import star from "/public/assets/star-rating.svg";
import { useState } from "react";
export default function RatingStars() {
  const rate = [1, 2, 3, 4, 5];
  const [selectedRating, setSelectedRating] = useState(null);
  const [filteredRating, setFilteredRating] = useState(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {rate.reverse().map((num, index) => (
          <button
            key={index}
            id={num}
            role="checkbox"
            onClick={() => {
              setSelectedRating(num);
              setFilteredRating(num);
            }}
            className={`flex px-2 py-1 items-center justify-center font-medium gap-1 border rounded-lg text-[16px] ${
              selectedRating === num
                ? "border-[var(--primary-orange-color-500)] text-[var(--primary-orange-color-500)]"
                : "border-[var(--primary-gray-color-100)] text-[var(--primary-gray-color-300)]"
            } `}
          >
            {num}
            {Array.from({ length: num }).map((_, index) => (
              <Image src={star} alt="Star Rating" key={index} />
            ))}
          </button>
        ))}
      </div>
    </>
  );
}
