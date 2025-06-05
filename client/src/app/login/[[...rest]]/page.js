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
    <div className="flex flex-col md:flex-row min-h-screen relative bg-white">
      <AuthIllustrations />

      <div className="z-10 flex flex-1 justify-center items-center w-full gap-10 px-4 py-15">
        <div className="flex flex-col gap-14 max-w-[440px] w-full">
          <AuthHeader />
          <div className="w-full flex flex-col gap-8">
            <LoginForm
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              handleLogin={handleLogin}
              emailError={emailError}
              passwordError={passwordError}
            />

            <div className="flex items-center gap-3 w-full">
              <div className="flex-grow border-t border-[#DCDFED]"></div>
              <span className="text-lg text-[#7B7E8F]">Or Continue With</span>
              <div className="flex-grow border-t border-[#DCDFED]"></div>
            </div>

            <SocialLoginButtons />

            <div className="flex flex-row justify-center items-center gap-2 w-full">
              <p className="text-lg font-medium text-[#060D18] leading-6.5">
                Don&apos;t have any account?{" "}
              </p>
              <div className="flex py-1 px-0.5 gap-1">
                <Link
                  href="/register"
                  className="text-[#FF7037] hover:text-[#FF986F] active:text-[#E44A0C] font-bold w-[61px] hover:underline"
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
