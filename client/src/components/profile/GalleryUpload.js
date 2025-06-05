import React, { useRef, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import xwhite from "/public/assets/profile/x-white.svg";
import plusborder from "/public/assets/profile/plus-border.svg";

// แยก ImageItem เป็น component ย่อย และใช้ memo เพื่อป้องกัน re-renders ที่ไม่จำเป็น
const ImageItem = memo(({ file, index, onRemove }) => {
  // คำนวณ image URL เฉพาะเมื่อ file เปลี่ยน
  const imageUrl = useMemo(() => {
    if (!file) return null;
    return (
      file.preview || (file instanceof File ? URL.createObjectURL(file) : file)
    );
  }, [file]);

  // cleanup URL objects เมื่อ component unmount
  React.useEffect(() => {
    if (file instanceof File && imageUrl && imageUrl.startsWith("blob:")) {
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [file, imageUrl]);

  return (
    <div className="relative w-[167px] h-[167px] rounded-lg bg-[#DCDFED]">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={`gallery-${index}`}
          fill
          sizes="167px"
          className="object-cover overflow-hidden rounded-lg"
        />
      )}
      <button
        type="button"
        className="absolute -top-1 -right-1 bg-[#7B7E8F] text-white rounded-full w-6 h-6 flex items-center justify-center"
        onClick={() => onRemove(index)}
        aria-label="Remove image"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <Image src={xwhite} alt="remove" width={8} height={8} />
        </div>
      </button>
    </div>
  );
});

// ใช้ memo เพื่อ prevent re-render เมื่อ props ไม่เปลี่ยนแปลง
const GalleryUpload = memo(({ value = [], onChange, error }) => {
  const inputRef = useRef(null);

  // ใช้ useCallback เพื่อไม่ให้สร้างฟังก์ชันใหม่ทุกครั้งที่ render
  const handleFileChange = useCallback(
    (e) => {
      const fileList = Array.from(e.target.files || []);
      if (!fileList.length) return;

      // ตรวจสอบจำนวนไฟล์และขนาด
      const totalFiles = (value || []).length + fileList.length;
      if (totalFiles > 10) {
        alert("You can upload maximum 10 images");
        return;
      }

      // เพิ่มไฟล์ใหม่เข้าไปใน array เดิม และจำกัดไม่เกิน 10 รูป
      onChange([...(value || []), ...fileList].slice(0, 10));
    },
    [value, onChange]
  );

  const handleRemove = useCallback(
    (idx) => {
      onChange(value.filter((_, i) => i !== idx));
    },
    [value, onChange]
  );

  // คำนวณว่ายังอัพโหลดได้อีกหรือไม่
  const canUploadMore = useMemo(() => value.length < 10, [value.length]);

  return (
    <div>
      <div className="flex gap-2 sm:gap-4 flex-wrap">
        {/* แสดงรูปภาพที่อัพโหลดแล้ว */}
        {value.map((file, idx) => (
          <ImageItem
            key={idx}
            file={file}
            index={idx}
            onRemove={handleRemove}
          />
        ))}

        {/* ปุ่มอัพโหลดรูปภาพเพิ่ม */}
        {canUploadMore && (
          <label className="w-[167px] h-[167px] bg-[#FFF3ED] text-[#FF7037] rounded-lg flex flex-col items-center justify-center cursor-pointer">
            <div className="w-[48px] h-[48px] mb-4 flex items-center justify-center">
              <Image src={plusborder} alt="upload" width={40} height={40} />
            </div>
            <span className="text-[16px] font-bold">Upload Image</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              multiple
              onChange={handleFileChange}
              ref={inputRef}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* แสดง error ถ้ามี */}
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </div>
  );
});

// เพิ่ม displayName เพื่อให้ง่ายต่อการ debug
ImageItem.displayName = "ImageItem";
GalleryUpload.displayName = "GalleryUpload";

export default GalleryUpload;
