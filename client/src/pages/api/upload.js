import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"; // เพิ่ม import jwt ที่หายไป

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
  // เปลี่ยนจากการตรวจสอบ Authorization header เป็นการตรวจสอบ cookie
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // เพิ่มตรวจสอบว่า decoded มี id หรือไม่
    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid token format" });
    }

    // ดำเนินการต่อไปตามปกติ
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const form = formidable({ multiples: true });

    // เพิ่ม debug log เพื่อตรวจสอบ request
    console.log("Request received with headers:", req.headers["content-type"]);

    // ดัก error จาก formidable ให้ชัดเจนขึ้น
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable parsing error:", err);
          reject(err);
        }
        // เพิ่ม log เพื่อดูโครงสร้างของ files
        console.log(
          "Files parsed by formidable:",
          JSON.stringify(files, null, 2)
        );
        resolve([fields, files]);
      });
    });

    console.log("Files object keys:", Object.keys(files));

    // แก้ไขการเข้าถึง file object
    let fileToProcess;

    // กรณี 1: ตรวจสอบว่ามี file property หรือไม่
    if (files.file) {
      if (Array.isArray(files.file)) {
        fileToProcess = files.file[0]; // รองรับกรณีที่ส่ง files มาหลายไฟล์
      } else {
        fileToProcess = files.file;
      }
    } else {
      // กรณี 2: หา key แรกใน files object
      const fileKeys = Object.keys(files);
      if (fileKeys.length > 0) {
        fileToProcess = files[fileKeys[0]];
        if (Array.isArray(fileToProcess)) {
          fileToProcess = fileToProcess[0];
        }
      }
    }

    // ตรวจสอบว่าได้ไฟล์ที่ถูกต้องหรือไม่
    if (!fileToProcess || typeof fileToProcess.filepath === "undefined") {
      console.error("Invalid file structure:", fileToProcess);
      return res.status(400).json({ error: "Invalid file upload structure" });
    }

    // ตรวจสอบ filepath
    console.log("File path:", fileToProcess.filepath);

    // อ่านไฟล์จาก filepath
    const fileData = fs.readFileSync(fileToProcess.filepath);

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const filename = `${uuidv4()}-${
      fileToProcess.originalFilename || "upload"
    }`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("pet-sitter-images") // ชื่อ bucket ที่สร้างใน Supabase
      .upload(filename, fileData, {
        contentType: fileToProcess.mimetype, // แก้จาก file.mimetype เป็น fileToProcess.mimetype
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("pet-sitter-images")
      .getPublicUrl(filename);

    return res.status(200).json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Error processing upload:", error);
    return res
      .status(401)
      .json({ error: "Authentication failed: " + error.message });
  }
}
