import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // ดึง token จาก cookie
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    // แยกตาม HTTP method
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("pet_sitter")
        .select("bank_name, acc_no, acc_name, book_bank_image_url") // เพิ่ม acc_name
        .eq("user_id", userId)
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // เปลี่ยนชื่อฟิลด์ให้ตรงกับที่ frontend ใช้
      const bankDetails = data
        ? {
            bank_name: data.bank_name,
            account_number: data.acc_no,
            account_name: data.acc_name, // เพิ่มฟิลด์ account_name
            book_bank_image_url: data.book_bank_image_url,
          }
        : {};

      return res.status(200).json({ bankDetails });
    } else if (req.method === "POST") {
      const { bankName, accountNumber, accountName, book_bank_image_url } =
        req.body; // เพิ่ม accountName

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!bankName || !accountNumber || !accountName) {
        // เพิ่มการตรวจสอบ accountName
        return res.status(400).json({
          error: "Bank name, account number, and account name are required",
        });
      }

      // อัพเดทข้อมูลในตาราง pet_sitter
      const { data, error } = await supabase
        .from("pet_sitter")
        .update({
          bank_name: bankName,
          acc_no: accountNumber,
          acc_name: accountName, // เพิ่ม acc_name
          book_bank_image_url: book_bank_image_url,
        })
        .eq("user_id", userId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, data });
    } else {
      // Method ไม่รองรับ
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
