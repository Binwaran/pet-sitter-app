// app/login/[...rest]/page.js
"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner"; // ✅

import AuthIllustrations from "@/components/Auth/AuthIllustrations";
import AuthHeader from "@/components/Auth/AuthHeader";
import SocialLoginButtons from "@/components/Auth/SocialLoginButtons";
import LoginForm from "@/components/Auth/LoginForm";

export default function CustomLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);

    // ✅ [1] ตรวจว่ากรอกครบหรือยัง
  if (!email || !password) {
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
    toast.error("Email and password are required");
    return;
  }

  // ✅ [2] ตรวจรูปแบบอีเมล
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      setEmailError(true);
      toast.error("Invalid email format");
      return;
  }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
  if (data.errors) {
    if (data.errors.email) {
      setEmailError(true);
      toast.error(data.errors.email);
    }
    if (data.errors.password) {
      setPasswordError(true);
      // แสดงเฉพาะ error แรกที่เจอ
      if (!data.errors.email) toast.error(data.errors.password);
    }
  } else {
    // fallback เฉพาะกรณีไม่มี errors
    toast.error(data.message || "Login failed");
  }
  return;
}

      // ✅ Save JWT token to localStorage
      localStorage.setItem("token", data.token);
      toast.success("Login สำเร็จ!"); // ✅

      setTimeout(() => {
      // ✅ Redirect to dashboard or home page
         window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      toast.error("Something went wrong"); // ✅
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
            // error={""} // ❌ ไม่ต้องใช้แล้วถ้าใช้ toast
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
