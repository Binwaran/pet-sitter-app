import React from "react";
import Image from "next/image";
import xwhite from "/public/assets/profile/x-white.svg";
import plusborder from "/public/assets/profile/plus-border.svg";

export default function GalleryUpload({ value = [], onChange }) {
  // handle file input change
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    // รวมกับรูปเดิม (ถ้ามี)
    const newFiles = [...value, ...files].slice(0, 10);
    onChange(newFiles);
  };

  // handle remove image
  const handleRemove = (idx) => {
    const newFiles = value.filter((_, i) => i !== idx);
    onChange(newFiles);
  };

  return (
    <div>
      <div className="flex gap-2 sm:gap-4 flex-wrap">
        {value.map((file, idx) => (
          <div
            key={idx}
            className="relative w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[167px] md:h-[167px] rounded-lg bg-[#DCDFED]"
          >
            <Image
              src={
                file.preview ||
                (file instanceof File ? URL.createObjectURL(file) : file)
              }
              alt={`gallery-${idx}`}
              fill
              className="object-cover overflow-hidden rounded-lg"
              onLoad={() => {
                // free memory when done
                if (file instanceof File) URL.revokeObjectURL(file.preview);
              }}
            />
            <button
              type="button"
              className="absolute -top-1 -right-1 bg-[#7B7E8F] text-white rounded-full w-6 h-6 flex items-center justify-center"
              onClick={() => handleRemove(idx)}
              aria-label="Remove image"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <Image src={xwhite} alt="remove" width={8} height={8} />
              </div>
            </button>
          </div>
        ))}
        {value.length < 10 && (
          <label className="w-[167px] h-[167px] bg-[#FFF3ED] text-[#FF7037] rounded-lg flex flex-col items-center justify-center cursor-pointer">
            <div className="w-[48px] h-[48px] mb-4 flex items-center justify-center">
              <Image src={plusborder} alt="upload" width={40} height={40} />
            </div>
            <span className="text-[16px] font-bold">Upload Image</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
