// app/login/[...rest]/page.js
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AuthIllustrations from "@/components/Auth/AuthIllustrations";
import AuthHeader from "@/components/Auth/AuthHeader";
import SocialLoginButtons from "@/components/Auth/SocialLoginButtons";
import LoginForm from "@/components/Auth/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function CustomLogin() {
  const { login, loading } = useAuth();
  const router = useRouter();
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
      toast.error("Email and password are required");
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
        router.push("/dashboard");
      }, 1000);
    } else {
      // แสดง error
      if (result.message?.toLowerCase().includes("email")) setEmailError(true);
      if (result.message?.toLowerCase().includes("password")) setPasswordError(true);
      toast.error(result.message || "Login failed");
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
