import { useState, useRef, useEffect, memo } from "react";
import Image from "next/image";
import plus from "/public/assets/profile/plus.svg";
import profileImg from "/public/assets/profile/profileimg.svg";

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
const ImageUpload = memo(({ value, onChange, error }) => {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  // ปรับปรุง useEffect ให้กระชับและเร็วขึ้น
  useEffect(() => {
    // กรณีไม่มี value หรือเป็น string url ตรง
    if (!value) {
      setPreview(null);
      return;
    }

    // ถ้าเป็น URL string ใช้เลย
    if (typeof value === "string") {
      setPreview(value);
      return;
    }

    // ถ้าเป็น File object ให้สร้าง URL
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      // ทำความสะอาด URL เมื่อ component unmount หรือ value เปลี่ยน
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  // รวมฟังก์ชันการจัดการไฟล์ให้สั้นลง
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  // ปรับการเปิด file dialog ให้เป็นฟังก์ชันเดียว
  const triggerFileSelect = () => inputRef.current?.click();

  return (
    <div>
      <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[240px] md:h-[240px] rounded-full bg-[#DCDFED] flex items-center justify-center mx-auto">
        {/* แสดงรูปภาพหรือ Profile เริ่มต้น */}
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
            className="w-[104px] h-[104px]"
          />
        )}

        {/* ปุ่มเพิ่มรูปภาพ */}
        <button
          type="button"
          className="absolute bottom-0 right-0 w-[60px] h-[60px] rounded-full bg-[#FFF1EC] flex items-center justify-center shadow"
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

      {/* แสดงข้อความ error ถ้ามี */}
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </div>
  );
});

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;
