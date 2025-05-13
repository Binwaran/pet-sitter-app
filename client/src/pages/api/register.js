import { supabase } from "@/utils/supabase";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, phone, password } = req.body;

    // ตรวจสอบข้อมูลที่ส่งมา
    if (!email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      // ตรวจสอบว่าอีเมลซ้ำหรือไม่
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered." });
      }

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      // เข้ารหัส (hash) รหัสผ่าน
      const hashedPassword = await bcrypt.hash(password, 10);

      // บันทึกข้อมูลผู้ใช้ลงใน Supabase
      const { data: insertedUser, error } = await supabase
        .from("users")
        .insert([
          {
            email,
            phone,
            password: hashedPassword,
            role: "owner",
          },
        ]);

      if (error) {
        throw error;
      }

      return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error("Error saving user in Supabase:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}