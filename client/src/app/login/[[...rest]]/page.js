// app/login/[...rest]/page.js
"use client";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";

import AuthIllustrations from "@/components/Auth/AuthIllustrations";
import AuthHeader from "@/components/Auth/AuthHeader";
import SocialLoginButtons from "@/components/Auth/SocialLoginButtons";
import LoginForm from "@/components/Auth/LoginForm";

export default function CustomLogin() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        console.log(result);
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Login failed");
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
            error={error}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-600">Or Continue With</span>
            </div>
          </div>

          <SocialLoginButtons />

          <p className="text-center text-sm text-gray-600">
            Don’t have any account?{" "}
            <Link href="/register" className="text-orange-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
