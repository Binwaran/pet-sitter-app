// app/login/[...rest]/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AuthIllustrations from "@/components/Auth/AuthIllustrations";
import AuthHeader from "@/components/Auth/AuthHeader";
import SocialLoginButtons from "@/components/Auth/SocialLoginButtons";
import LoginForm from "@/components/Auth/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function CustomLogin({ params }) {
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // อ่าน path จาก sessionStorage
      let redirectPath = null;
      if (typeof window !== "undefined") {
        redirectPath = sessionStorage.getItem("redirectPath");
      }
      if (redirectPath && redirectPath !== "/login") {
        router.replace(redirectPath);
        sessionStorage.removeItem("redirectPath");
      } else if (user.role === "owner") {
        router.replace("/pet-owners/profile");
      } else if (user.role === "sitter") {
        router.replace("/pet-sitters/profile");
      } else {
        router.replace("/");
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
      // ไม่ต้อง redirect ที่นี่ ให้ useEffect จัดการ
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
        if (!result.errors.email && !result.errors.password) {
          setEmailError(true);
          setPasswordError(true);
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
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <AuthIllustrations />
      
      {/* ปรับ padding และ spacing ให้เหมือน register */}
      <div className="z-10 flex flex-1 justify-center items-center w-full px-4">
        <div className="flex flex-col gap-6 max-w-[440px] w-full">
          {/* Header section - ปรับ style ให้เหมือน register */}
          <div className="flex items-center justify-center w-full mb-2">
            <div className="text-center flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl lg:text-6xl font-bold text-black">
                Welcome Back!
              </h1>
              <p className="text-[#7B7E8F] text-sm md:text-base lg:text-lg font-medium">
                Sign in to continue to Pet Society
              </p>
            </div>
          </div>

          {/* Form section - ปรับ gap ให้กระชับ */}
          <div className="w-full flex flex-col gap-4">
            <LoginForm
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              handleLogin={handleLogin}
              emailError={emailError}
              passwordError={passwordError}
            />

            {/* Divider - ปรับ style */}
            <div className="flex items-center gap-3 w-full my-2">
              <div className="flex-grow border-t border-[#DCDFED]"></div>
              <span className="text-sm md:text-base text-[#7B7E8F]">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-[#DCDFED]"></div>
            </div>

            {/* Social buttons */}
            <SocialLoginButtons />

            {/* Register link - ปรับ style */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <p className="text-sm md:text-base font-medium text-[#060D18]">
                  Don&apos;t have any account?
                </p>
                <Link
                  href="/register"
                  className="text-[#FF7037] hover:text-[#FF986F] active:text-[#E44A0C] font-bold hover:underline text-sm md:text-base"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
