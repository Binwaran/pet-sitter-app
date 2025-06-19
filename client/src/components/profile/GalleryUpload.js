import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  memo,
  useEffect,
} from "react";
import Image from "next/image";
import xwhite from "/public/assets/profile/x-white.svg";
import plusborder from "/public/assets/profile/plus-border.svg";

// ImageItem component with pending approval indicator
const ImageItem = memo(({ file, index, onRemove, isPending = false }) => {
  // เพิ่ม state สำหรับจัดการกรณีโหลดรูปไม่สำเร็จ
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // เปลี่ยนเป็นการตรวจสอบเงื่อนไขโดยตรง
  const shouldShowPending = isPending || file instanceof File;

  // ใช้ useEffect เพื่อจัดการ blob URL เพื่อป้องกัน memory leak
  useEffect(() => {
    let objectUrl = null;

    // ล้าง error state เมื่อไฟล์เปลี่ยน
    setHasError(false);

    try {
      if (!file) {
        setImageUrl(null);
        return;
      }

      // กรณีเป็นไฟล์ที่เพิ่งอัพโหลด
      if (file instanceof File) {
        objectUrl = URL.createObjectURL(file);
        setImageUrl(objectUrl);
      }
      // กรณีเป็น URL โดยตรง (string)
      else if (typeof file === "string") {
        setImageUrl(file);
      }
      // กรณีเป็น Object จาก API
      else if (typeof file === "object" && file !== null) {
        if (file.url) setImageUrl(file.url);
        else if (file.publicUrl) setImageUrl(file.publicUrl);
        else if (file.path) setImageUrl(file.path);
        else {
          // หาค่าใดๆ ที่เป็น URL
          for (const key of Object.keys(file)) {
            const value = file[key];
            if (
              typeof value === "string" &&
              (value.startsWith("http") || value.startsWith("/"))
            ) {
              setImageUrl(value);
              break;
            }
          }
        }
      }
    } catch (error) {
      setHasError(true);
    }

    // Cleanup function
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  // handler สำหรับการโหลดรูปไม่สำเร็จ
  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <div className="relative w-[167px] h-[167px] rounded-lg bg-[#DCDFED]">
      {imageUrl && !hasError ? (
        // ใช้ HTML img tag แทน Next Image เพื่อความสามารถในการจัดการ error ได้ดีกว่า
        <img
          src={imageUrl}
          alt={`gallery-${index}`}
          className="w-full h-full object-cover overflow-hidden rounded-lg"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-2 px-2 text-center">
            {hasError ? "Image load failed" : "No image"}
          </span>
        </div>
      )}

      {shouldShowPending && (
        <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs px-2 py-1 rounded-bl-md">
          Pending
        </div>
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

// Main GalleryUpload component
const GalleryUpload = memo(
  ({ value = [], onChange, error, isPending = false }) => {
    const inputRef = useRef(null);

    // จัดการกับข้อมูลที่อาจไม่ใช่อาร์เรย์
    const normalizedValue = useMemo(() => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return [];
    }, [value]);

    const handleFileChange = useCallback(
      (e) => {
        try {
          const fileList = e.target.files;
          if (!fileList || fileList.length === 0) return;

          // แปลง FileList เป็น Array
          const filesArray = Array.from(fileList);

          // เช็คจำนวนไฟล์รวม
          const totalFiles = normalizedValue.length + filesArray.length;
          if (totalFiles > 10) {
            alert(
              `You can upload a maximum of 10 files (${
                10 - normalizedValue.length
              } slots remaining)`
            );
            const maxNewFiles = 10 - normalizedValue.length;
            if (maxNewFiles <= 0) return;
            filesArray.splice(maxNewFiles); // ตัดจำนวนไฟล์ให้พอดีกับที่เหลือ
          }

          // คัดกรองไฟล์ที่มีขนาดใหญ่เกินไป
          const filteredFiles = filesArray.filter((file) => {
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
              return false;
            }
            return true;
          });

          if (filteredFiles.length === 0) {
            alert(
              "Cannot upload files. Files are too large (maximum 2MB per file)"
            );
            return;
          }

          if (filteredFiles.length !== filesArray.length) {
            alert(`Some files couldn't be uploaded because they exceed 2MB`);
          }

          // เพิ่มไฟล์ใหม่เข้าไปในอาร์เรย์
          const updatedFiles = [...normalizedValue];
          filteredFiles.forEach((file) => {
            updatedFiles.push(file);
          });

          onChange(updatedFiles);

          // ล้าง input เพื่อให้เลือกไฟล์ซ้ำได้
          e.target.value = "";
        } catch (error) {
          alert("An error occurred while uploading files. Please try again");
          e.target.value = "";
        }
      },
      [normalizedValue, onChange]
    );

    // Handle image removal
    const handleRemove = useCallback(
      (idx) => {
        const newFiles = [...normalizedValue];
        newFiles.splice(idx, 1);
        onChange(newFiles);
      },
      [normalizedValue, onChange]
    );

    // Calculate if more uploads are allowed
    const canUploadMore = useMemo(
      () => normalizedValue.length < 10,
      [normalizedValue.length]
    );

    return (
      <div>
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          {normalizedValue.map((file, idx) => (
            <ImageItem
              key={`gallery-item-${idx}-${Date.now()}-${Math.random()
                .toString(36)
                .substring(7)}`}
              file={file}
              index={idx}
              onRemove={handleRemove}
              isPending={isPending}
            />
          ))}

          {canUploadMore && (
            <label className="w-[167px] h-[167px] bg-[#FFF3ED] text-[#FF7037] rounded-lg flex flex-col items-center justify-center cursor-pointer">
              <div className="w-[48px] h-[48px] mb-4 flex items-center justify-center">
                <Image src={plusborder} alt="upload" width={40} height={40} />
              </div>
              <span className="text-[16px] font-bold">Upload Image</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                multiple
                onChange={handleFileChange}
                ref={inputRef}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    );
  }
);

// Add displayName for better debugging
ImageItem.displayName = "ImageItem";
GalleryUpload.displayName = "GalleryUpload";

export default GalleryUpload;
