import { supabase } from "@/utils/supabase";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      // เช็ค email ซ้ำ
      const { data: existingEmail } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      // เช็ค phone ซ้ำ
      const { data: existingPhone } = await supabase
        .from("users")
        .select("phone")
        .eq("phone", phone)
        .single();

      const errors = [];
      if (existingEmail) errors.push("email");
      if (existingPhone) errors.push("phone");

      if (errors.length > 0) {
        return res.status(400).json({
          error: {
            fields: errors,
            message: errors.map((field) =>
              `${field === "email" ? "Email" : "Phone number"} is already registered`
            ),
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: insertedUser, error } = await supabase
        .from("users")
        .insert([
          {
            email,
            phone,
            password: hashedPassword,
            role: req.body.role || "owner", // ใช้ role ที่ส่งมาจาก frontend
          },
        ]);

      if (error) {
        throw error;
      }

      return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
