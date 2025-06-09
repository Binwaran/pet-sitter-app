import axios from "axios";

// Upload single file and get URL back
export const uploadFile = async (file) => {
  if (!file || !(file instanceof File)) return null;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return response.data?.url || null;
  } catch (error) {
    throw new Error("Failed to upload file");
  }
};

// Upload multiple files and get URLs back
export const uploadMultipleFiles = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];

  // Filter files that need uploading vs existing URLs
  const filesToUpload = files.filter((file) => file instanceof File);
  const existingUrls = files.filter((file) => typeof file === "string");

  // Enforce 10-file limit
  if (filesToUpload.length + existingUrls.length > 10) {
    const totalAllowed = 10 - existingUrls.length;
    filesToUpload.splice(totalAllowed);
  }

  try {
    // Upload all files in parallel
    const uploadPromises = filesToUpload.map((file) => uploadFile(file));
    const uploadedUrls = await Promise.all(uploadPromises);

    // Return combined URLs (existing + new)
    return [...existingUrls, ...uploadedUrls.filter((url) => url !== null)];
  } catch (error) {
    // Return just existing URLs on error
    return existingUrls;
  }
};
