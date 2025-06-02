// app/login/[...rest]/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import AuthIllustrations from "@/components/Auth/AuthIllustrations";
import AuthHeader from "@/components/Auth/AuthHeader";
import SocialLoginButtons from "@/components/Auth/SocialLoginButtons";
import LoginForm from "@/components/Auth/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function CustomLogin({ params }) {
  // params.rest จะเป็น array ของ segment ที่ตามหลัง /login เช่น /login/xxx/yyy => params.rest = ['xxx', 'yyy']
  // สามารถใช้ params.rest ได้ถ้าต้องการแยก logic ตาม path

  const { user, login, loading } = useAuth(); // เพิ่ม user
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  // เช็คว่าถ้า login อยู่แล้ว ให้ redirect ไป profile ตาม role
  useEffect(() => {
    if (user) {
      if (user.role === "owner") {
        router.replace("/pet-owners/profile");
      } else if (user.role === "sitter") {
        router.replace("/pet-sitters/profile");
      } else {
        router.replace("/"); // fallback
      }
    }
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);

    // [1] ตรวจว่ากรอกครบหรือยัง
    if (!email || !password) {
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
      setTimeout(() => {
        toast.error("Email and password are required");
      }, 0);
      return;
    }

    // [2] ตรวจรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(true);
      toast.error("Invalid email format");
      return;
    }

    // [3] เรียก login จาก context
    const result = await login(email, password);

    if (result.success) {
      toast.success("Login สำเร็จ!");
      setTimeout(() => {
        router.push(redirect); // ใช้ redirect ที่ได้จาก query
      }, 1000);
    } else {
      // แสดง error
      if (result.errors) {
        if (result.errors.email) {
          setEmailError(true);
          toast.error(result.errors.email);
        }
        if (result.errors.password) {
          setPasswordError(true);
          toast.error(result.errors.password);
        }

        // หากไม่มี error แบบระบุช่อง ให้แจ้งรวม
        if (!result.errors.email && !result.errors.password) {
          setEmailError(true); // 👈 เพิ่ม
          setPasswordError(true); // 👈 เพิ่ม
          toast.error("Login failed. Please try again.");
        }
      } else {
          setEmailError(true);
          setPasswordError(true);
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative bg-white">
      <AuthIllustrations />

      <div className="z-10 flex flex-1 justify-center items-center p-6 md:p-16">
        <div className="w-full max-w-md space-y-6">
          <AuthHeader />
          <LoginForm
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            handleLogin={handleLogin}
            emailError={emailError}
            passwordError={passwordError}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-600">
                Or Continue With
              </span>
            </div>
          </div>

          <SocialLoginButtons />

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have any account?{" "}
            <Link href="/register" className="text-orange-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
