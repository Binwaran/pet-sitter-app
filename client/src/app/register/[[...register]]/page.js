"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import InputField from "@/components/register/InputField.js";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/components/InputVerification";
import Link from "next/link";
import AuthIllustrations from "@/components/Auth/AuthIllustrations";
import SocialLoginButtons from "@/components/Auth/SocialLoginButtons";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  let role = "owner";

  if (params?.register) {
    // ถ้าเป็น array (เช่น ["sitter"])
    if (
      Array.isArray(params.register) &&
      params.register.length > 0 &&
      params.register[0]
    ) {
      role = params.register[0];
    }
    // ถ้าเป็น string (เช่น "sitter")
    else if (typeof params.register === "string" && params.register) {
      role = params.register;
    }
  }

  // กำหนดข้อความตาม role
  const roleText = {
    owner: {
      header: "Join Us!",
      subHeader: "Find your perfect pet sitter with us",
      already: "Already have an account?",
    },
    sitter: {
      header: "Join Us!",
      subHeader: "Become the best Pet Sitter with us",
      already: "Already have Pet Sitter account?",
    },
  };

  const text = roleText[role] || roleText.owner;

  useEffect(() => {
    if (user) {
      if (user.role === "owner") {
        router.replace("/pet-owners/profile");
      } else if (user.role === "sitter") {
        router.replace("/pet-sitters/profile");
      } else {
        router.replace("/");
      }
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const validationRules = {
    email: {
      validate: validateEmail,
      errorMessage: "Please enter a valid email. (e.g., example@domain.com)",
    },
    phone: {
      validate: validatePhone,
      errorMessage: "Phone number must be 10 digits.",
    },
    password: {
      validate: validatePassword,
      errorMessage: "Password must be longer than 8 characters.",
    },
    confirmPassword: {
      validate: (value) => value === formData.password,
      errorMessage: "Passwords do not match.",
    },
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {};

    for (const field in validationRules) {
      const { validate, errorMessage } = validationRules[field];
      if (!validate(formData[field])) {
        newErrors[field] = errorMessage;
        isValid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role, // ส่ง role ไปด้วย
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration successful!");
          router.push("/login");
        } else {
          setErrors((prev) => ({ ...prev, general: data.error }));
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          general: "An unexpected error occurred.",
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }

    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      newFormData = { ...formData, [name]: onlyNums };
    }

    setFormData(newFormData);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative bg-white">
      <AuthIllustrations />
      <div className="z-10 flex flex-1 justify-center items-center w-full gap-10 px-4 py-15">
        <div className="flex flex-col gap-14 max-w-[440px] w-full">
          {/* Header */}
          <div className="flex items-center justify-center gap-6 md:pb-6 w-full">
            <div className="text-center flex flex-col gap-2 w-full">
              <h1 className="text-4xl md:text-[56px] font-bold text-black leading-[44px] md:leading-[64px]">
                {text.header}
              </h1>
              <p className="text-[#7B7E8F] text-lg md:text-2xl font-medium md:font-bold leading-[26px] md:leading-[32px]">
                {text.subHeader}
              </p>
            </div>
          </div>
          {/* Registration Form */}
          <div className="w-full flex flex-col gap-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="email@company.com"
              />
              <InputField
                label="Phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="Your phone number"
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create your password"
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
              />
              <button
                type="submit"
                className="flex justify-center items-center w-full min-w-30 bg-[#FF7037] hover:bg-[#FF986F] active:bg-[#E44A0C] h-12 px-6 py-3 gap-2 rounded-full transition"
              >
                <p className="text-white text-base font-bold w-[59px]">
                  Register
                </p>
              </button>
              {errors.general && (
                <p className="text-red-500 text-sm mt-2">{errors.general}</p>
              )}
            </form>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-grow border-t border-[#DCDFED]"></div>
              <span className="text-lg text-[#7B7E8F]">Or Continue With</span>
              <div className="flex-grow border-t border-[#DCDFED]"></div>
            </div>

            <SocialLoginButtons />

            <div className="flex flex-row justify-center items-center gap-2 w-full">
              <p className="text-lg font-medium text-[#060D18] leading-6.5">
                {text.already}{" "}
              </p>
              <div className="flex py-1 px-0.5 gap-1">
                <Link
                  href="/login"
                  className="text-[#FF7037] hover:text-[#FF986F] active:text-[#E44A0C] font-bold w-[61px] hover:underline"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* ปุ่มสลับ role */}
            <div className="flex flex-row justify-center items-center mt-2">
              {role === "owner" ? (
                <button
                  type="button"
                  className="text-[#FF7037] hover:underline font-bold"
                  onClick={() => router.push("/register/sitter")}
                >
                  Become A Pet Sitter
                </button>
              ) : (
                <button
                  type="button"
                  className="text-[#FF7037] hover:underline font-bold"
                  onClick={() => router.push("/register/owner")}
                >
                  Become A Pet Owner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
