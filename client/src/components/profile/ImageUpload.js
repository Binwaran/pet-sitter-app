import Image from "next/image";
import { useRef, memo } from "react";
import plus from "/public/assets/profile/plus.svg";
import profileImg from "/public/assets/profile/profileimg.svg";
import petImg from "/public/assets/profile/petimg.svg"; // เพิ่ม import สำหรับ pet avatar

const ImageUpload = memo(
  ({
    value,
    onChange,
    error,
    requiresApproval = false,
    isPending = false,
    type = "user",
  }) => {
    const inputRef = useRef(null);

    // เลือก default image ตาม type
    const defaultImage = type === "pet" ? petImg : profileImg;

    return (
      <div className="relative w-[240px] h-[240px]">
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {value ? (
            <Image
              src={
                typeof value === "string" ? value : URL.createObjectURL(value)
              }
              alt={type === "pet" ? "pet avatar" : "profile avatar"}
              fill
              className="object-cover"
            />
          ) : (
            <Image
              src={defaultImage}
              alt={
                type === "pet" ? "default pet avatar" : "default profile avatar"
              }
              width={87}
              height={87}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 w-[60px] h-[60px] rounded-full bg-[#FFF1EC] flex items-center justify-center shadow cursor-pointer"
        >
          <Image src={plus} alt="upload" width={18} height={18} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
          className="hidden"
        />
      </div>
    );
  }
);

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;
