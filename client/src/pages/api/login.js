import { supabase } from "@/utils/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  // 1. ดึงข้อมูล user ตาม email
  const { data: user, error } = await supabase
    .from("users") // 🔁 ตรวจชื่อ table ให้ตรงกับ Supabase ของคุณ
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // 2. ตรวจรหัสผ่าน
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // ✅ 3. สร้าง JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET, // ใช้ secret ที่คุณตั้งใน .env.local
    { expiresIn: "7d" } // อายุ token เช่น 7 วัน
  );

  // ✅ ส่ง token กลับ
  return res.status(200).json({
    message: "Login successful",
    token, // ✅ token ที่ส่งกลับไปให้ frontend
    user: {
      id: user.id,
      email: user.email,
    },
  });
}