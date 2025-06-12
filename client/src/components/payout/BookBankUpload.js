import { useState, useRef, useEffect, memo } from "react";
import Image from "next/image";
import plus from "/public/assets/profile/plus.svg";
import bookBankImg from "/public/assets/payout/landmark.svg"; // ควรสร้างไฟล์นี้หรือใช้รูปที่เหมาะสม

// เพิ่ม prop requiresApproval (default: false) เพื่อควบคุมการแสดง badge
const BookBankUpload = memo(
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
      if (!file) return;

      // ตรวจสอบขนาดไฟล์ (จำกัดที่ 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 2MB)");
        return;
      }

      // ตรวจสอบประเภทไฟล์
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น (.jpg, .jpeg, .png)");
        return;
      }

      onChange(file);
    };

    const triggerFileSelect = () => inputRef.current?.click();

    return (
      <div>
        <div className="relative w-53.75 h-55 sm:w-77.5 sm:h-75 md:w-93.75 md:h-90 lg:w-125 lg:h-120 rounded-lg bg-[#DCDFED] flex items-center justify-center mx-auto">
          {/* Display image or default book bank image */}
          {preview ? (
            <img
              src={preview}
              alt="Book Bank Preview"
              className="w-full h-full rounded-lg object-cover" // เปลี่ยนจาก rounded-full เป็น rounded-lg สำหรับสมุดบัญชี
              onError={() => setPreview(null)}
            />
          ) : (
            <Image
              src={bookBankImg}
              alt="Book Bank"
              width={208}
              height={208}
              priority={true}
              className="w-26 h-26 sm:w-32.5 sm:h-32.5 md:w-39 md:h-39 lg:w-52 lg:h-52"
            />
          )}

          {/* แสดง badge เฉพาะเมื่อมีการ flag ว่ากำลังรออนุมัติ */}
          {requiresApproval && isPending && (
            <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs px-2 py-1 rounded-b-md rounded-tr-md">
              Pending Approval
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            className="absolute bottom-2 right-2 w-10 h-10 sm:w-11.25 sm:h-11.25 md:w-12.5 md:h-12.5 lg:w-15 lg:h-15 rounded-full bg-[#FFF1EC] flex items-center justify-center"
            onClick={triggerFileSelect}
            aria-label="Upload book bank"
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

BookBankUpload.displayName = "BookBankUpload";

export default BookBankUpload;
