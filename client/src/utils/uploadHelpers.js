import axios from "axios";

// Upload single file and get URL back - เพิ่มพารามิเตอร์ type เพื่อระบุประเภทรูปภาพ
export const uploadFile = async (file, type = "gallery") => {
  if (!file || !(file instanceof File)) {
    console.error("Invalid file object:", file);
    return null;
  }

  // ตรวจสอบขนาดไฟล์
  if (file.size > 2 * 1024 * 1024) {
    throw new Error(`File ${file.name} is too large. Maximum size is 2MB.`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadType", type); // เพิ่มฟิลด์ uploadType เพื่อระบุประเภท

  try {
    console.log(`Uploading ${type} file: ${file.name}`);

    const response = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return response.data?.url || null;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload file");
  }
};

// Upload multiple files and get URLs back
export const uploadMultipleFiles = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];

  // Filter files that need uploading vs existing URLs
  const filesToUpload = files.filter((file) => file instanceof File);
  const existingUrls = files.filter((file) => typeof file === "string");

  // ตรวจสอบว่ามีไฟล์ที่ต้องอัพโหลดหรือไม่
  if (filesToUpload.length === 0) {
    return existingUrls;
  }

  console.log(`Starting upload for ${filesToUpload.length} files`);

  try {
    const uploadedUrls = [];
    let failedCount = 0;

    // อัพโหลดทีละไฟล์อย่างเป็นลำดับ
    for (const file of filesToUpload) {
      try {
        // เพิ่ม delay ระหว่างการอัพโหลดแต่ละไฟล์เพื่อลดโอกาสการ overload server
        if (uploadedUrls.length > 0) {
          await new Promise((r) => setTimeout(r, 500));
        }

        const url = await uploadFile(file);
        if (url) {
          uploadedUrls.push(url);
          console.log(`File ${file.name} uploaded successfully`);
        }
      } catch (error) {
        failedCount++;
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    console.log(
      `Upload complete. Success: ${uploadedUrls.length}, Failed: ${failedCount}`
    );

    // Return combined URLs (existing + new)
    return [...existingUrls, ...uploadedUrls];
  } catch (error) {
    console.error("Error in uploadMultipleFiles:", error);
    // Return just existing URLs on error
    return existingUrls;
  }
};

// Upload book bank image and get URL back
export const uploadBookBankImage = async (file) => {
  if (!file || !(file instanceof File)) {
    console.error("Invalid book bank image:", file);
    return null;
  }

  // ตรวจสอบขนาดไฟล์
  if (file.size > 2 * 1024 * 1024) {
    throw new Error(`File ${file.name} is too large. Maximum size is 2MB.`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadType", "book-bank"); // ระบุประเภทการอัพโหลด

  try {
    console.log(`Uploading book bank image: ${file.name}`);

    const response = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return response.data?.url || null;
  } catch (error) {
    console.error("Book bank image upload error:", error);
    throw new Error("Failed to upload book bank image");
  }
};
