import axios from "axios";

// Upload single file and get URL back
export const uploadFile = async (file) => {
  if (!file || !(file instanceof File)) {
    console.error("Invalid file object:", file);
    return null;
  }

  // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error(`File ${file.name} is too large. Maximum size is 2MB.`);
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // เพิ่ม retries เพื่อให้มีโอกาสอัพโหลดสำเร็จมากขึ้น
    let retries = 0;
    const maxRetries = 2;
    let lastError = null;
    
    while (retries <= maxRetries) {
      try {
        const response = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress (${file.name}): ${percentCompleted}%`);
          },
          timeout: 30000, // 30 seconds timeout
        });
        
        if (response.data?.url) {
          console.log(`Upload successful (${file.name}). URL: ${response.data.url}`);
          return response.data.url;
        } else {
          console.warn("Upload response missing URL:", response.data);
          throw new Error("Upload response missing URL");
        }
      } catch (err) {
        lastError = err;
        retries++;
        if (retries <= maxRetries) {
          console.warn(`Retry ${retries}/${maxRetries} for file ${file.name}`);
          // รอเวลาเล็กน้อยก่อน retry
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    
    // ถ้าทำ retries ครบแล้วยังไม่สำเร็จ ให้ throw error
    console.error("All upload retries failed:", lastError);
    throw lastError || new Error("Upload failed after retries");
  } catch (error) {
    console.error(`Upload error for ${file.name}:`, error.message);
    if (error.response) {
      console.error("Server response:", error.response.data);
    }
    throw error;
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
          await new Promise(r => setTimeout(r, 500));
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