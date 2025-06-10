import { useState, useRef, useEffect, memo } from "react";
import Image from "next/image";
import plus from "/public/assets/profile/plus.svg";
import profileImg from "/public/assets/profile/profileimg.svg";

// เพิ่ม prop requiresApproval (default: false) เพื่อควบคุมการแสดง badge
const ImageUpload = memo(
  ({ value, onChange, error, requiresApproval = false, isPending = false }) => {
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);

    // Streamlined useEffect for better performance
    useEffect(() => {
      // Case: No value
      if (!value) {
        setPreview(null);
        return;
      }

      // Case: String URL
      if (typeof value === "string") {
        setPreview(value);
        return;
      }

      // Case: File object - create preview URL
      if (value instanceof File) {
        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);

        // Clean up URL when component unmounts or value changes
        return () => URL.revokeObjectURL(objectUrl);
      }
    }, [value]);

    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) onChange(file);
    };

    const triggerFileSelect = () => inputRef.current?.click();

    return (
      <div>
        <div className="relative w-30 h-30 sm:w-45 sm:h-45 md:w-60 md:h-60 rounded-full bg-[#DCDFED] flex items-center justify-center mx-auto">
          {/* Display image or default profile */}
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-full h-full rounded-full object-cover"
              onError={() => setPreview(null)}
            />
          ) : (
            <Image
              src={profileImg}
              alt="Profile"
              width={104}
              height={104}
              priority={true}
              className="w-10 h-10 sm:w-18 sm:h-18 md:w-26 md:h-26"
            />
          )}

          {/* แสดง badge เมื่อเป็นไฟล์ใหม่หรือมีการ flag ว่ากำลังรออนุมัติ */}
          {requiresApproval && (value instanceof File || isPending) && (
            <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs px-2 py-1 rounded-b-md rounded-tr-md">
              Pending Approval
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            className="absolute bottom-0 right-0 w-10 h-10 sm:w-12.5 sm:h-12.5 md:w-15 md:h-15 rounded-full bg-[#FFF1EC] flex items-center justify-center shadow"
            onClick={triggerFileSelect}
            aria-label="Upload image"
          >
            <Image src={plus} alt="Add" width={18} height={18} />
          </button>

          {/* Hidden input */}
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            ref={inputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* แสดง error ถ้ามี */}
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    );
  }
);

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;
