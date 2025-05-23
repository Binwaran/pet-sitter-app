import { supabase } from "@/utils/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  // ✅ [1] ตรวจว่ากรอกข้อมูลครบไหม
  if (!email || !password) {
    return res.status(400).json({
      errors: {
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      },
    });
  }

  // ✅ [2] ค้นหา user จาก email
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  const errors = {};

  // ✅ [3] ตรวจสอบอีเมล
  if (error || !user) {
    errors.email = "Incorrect email";
  } else {
    // ✅ [4] ตรวจสอบรหัสผ่าน (ถ้าเจอ user แล้วเท่านั้น)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      errors.password = "Incorrect password";
    }
  }

  // ✅ [5] ถ้ามี error ใดๆ ส่งกลับ
  if (Object.keys(errors).length > 0) {
    return res.status(401).json({ errors });
  }

  // ✅ [6] สร้าง token และส่งกลับ
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role, 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role, 
    },
  });
}