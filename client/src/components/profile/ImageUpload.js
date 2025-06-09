import { useRef, memo } from "react";
import Image from "next/image";
import plus from "/public/assets/profile/plus.svg";
import avatar from "/public/assets/profile/profileimg.svg";

const ImageUpload = memo(({ onChange, error }) => {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  const triggerFileSelect = () => inputRef.current?.click();

  return (
    <div>
      <div className="relative w-[60px] h-[60px] mx-auto">

        {/* ปุ่มเพิ่มรูปภาพ */}
        <button
          type="button"
          className="absolute bottom-0 right-0 w-[60px] h-[60px] rounded-full bg-[#FFF1EC] flex items-center justify-center shadow cursor-pointer hover:bg-[#FFE0D5] transition-colors duration-200"
          onClick={triggerFileSelect}
          aria-label="Upload image"
        >
          <Image src={plus} alt="Add" width={18} height={18} />
        </button>

        {/* Input ที่ซ่อนไว้ */}
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </div>
  );
});

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;
