import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

// Disable body parsing, we'll handle it ourselves with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // ตรวจสอบว่าเป็น POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ตรวจสอบ token จาก cookie
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid token format" });
    }

    console.log("Processing upload request from user ID:", decoded.id);

    // เพิ่มขนาดไฟล์เป็น 2MB ให้ตรงกับ client-side check
    const form = formidable({
      multiples: true,
      maxFileSize: 2 * 1024 * 1024, // 2MB limit
      keepExtensions: true,
      allowEmptyFiles: false,
      minFileSize: 1,
    });

    // Parse form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable parsing error:", err);
          reject(err);
        }
        console.log("Files received:", Object.keys(files).length);
        console.log("Fields received:", fields);
        resolve([fields, files]);
      });
    });

    // หาไฟล์ที่จะอัพโหลด (ไม่ว่าจะอยู่ใน key ไหนก็ตาม)
    let fileToProcess = null;

    // วิธีที่ 1: ค้นหาจาก files.file ก่อน
    if (files.file) {
      if (Array.isArray(files.file)) {
        fileToProcess = files.file[0];
      } else {
        fileToProcess = files.file;
      }
    }

    // วิธีที่ 2: ถ้าไม่เจอใน key 'file' ให้ค้นหาจาก keys ทั้งหมด
    if (!fileToProcess) {
      Object.keys(files).forEach((key) => {
        if (!fileToProcess) {
          const fileData = files[key];
          if (Array.isArray(fileData) && fileData.length > 0) {
            fileToProcess = fileData[0];
          } else if (fileData && fileData.filepath) {
            fileToProcess = fileData;
          }
        }
      });
    }

    // ตรวจสอบว่าได้ไฟล์ที่ถูกต้องหรือไม่
    if (!fileToProcess || !fileToProcess.filepath) {
      console.error("No valid file found in request");
      return res.status(400).json({ error: "Missing file in upload request" });
    }

    // ตรวจสอบประเภทไฟล์ (รับเฉพาะรูปภาพ)
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const fileType = fileToProcess.mimetype;

    if (!validMimeTypes.includes(fileType)) {
      return res.status(400).json({
        error: "Invalid file type. Only JPG, JPEG, PNG and WebP are allowed.",
      });
    }

    console.log(
      `Processing file: ${fileToProcess.originalFilename}, type: ${fileToProcess.mimetype}, size: ${fileToProcess.size} bytes`
    );

    try {
      // อ่านไฟล์จาก filepath
      const fileData = fs.readFileSync(fileToProcess.filepath);
      const fileExt = fileToProcess.originalFilename
        .split(".")
        .pop()
        .toLowerCase();
      const safeMimeType = fileToProcess.mimetype || `image/${fileExt}`;

      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const filename = `${uuidv4()}.${fileExt}`;

      // เลือก bucket ตามประเภทการอัพโหลด - profile หรือ gallery
      // ตรวจสอบจาก fields ที่ส่งมา หรือตั้งให้เป็น gallery เป็นค่าเริ่มต้น
      let uploadType = "gallery"; // ค่าเริ่มต้น

      // ตรวจสอบประเภทการอัพโหลดจาก fields ที่ส่งมา
      if (fields.uploadType) {
        uploadType = fields.uploadType.toString().toLowerCase();
      } else if (fields.type) {
        uploadType = fields.type.toString().toLowerCase();
      } else if (fields.imageType) {
        uploadType = fields.imageType.toString().toLowerCase();
      }

      // กำหนด bucket ตามประเภทการอัพโหลด
      let bucketName;
      if (uploadType === "profile") {
        bucketName = "pet-sitter-images";
        console.log("Detected PROFILE image upload");
      } else if (uploadType === "book-bank") {
        bucketName = "book-bank-images";
        console.log("Detected BOOK BANK image upload");
      } else {
        bucketName = "pet-sitter-gallery";
        console.log("Detected GALLERY image upload");
      }

      // ปรับโครงสร้างไฟล์ให้เป็นแบบแบนๆ ไม่มี subfolder
      const filePath = filename; // ใช้ filename เฉยๆ ไม่มี subfolder

      console.log(
        `Uploading to Supabase bucket: ${bucketName}, file: ${filePath}`
      );

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileData, {
          contentType: safeMimeType,
          cacheControl: "3600",
          upsert: true, // เปลี่ยนเป็น true เพื่อให้แทนที่ไฟล์เดิมได้ถ้ามี
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res
          .status(500)
          .json({ error: `Storage upload failed: ${error.message}` });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        return res.status(500).json({ error: "Failed to get public URL" });
      }

      console.log("Upload successful:", urlData.publicUrl);
      return res.status(200).json({ url: urlData.publicUrl });
    } catch (fsError) {
      console.error("File system error:", fsError);
      return res
        .status(500)
        .json({ error: "File reading error: " + fsError.message });
    }
  } catch (error) {
    console.error("Error processing upload:", error);
    return res
      .status(500)
      .json({ error: "Upload failed: " + (error.message || "Unknown error") });
  }
}
