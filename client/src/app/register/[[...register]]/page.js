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
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <AuthIllustrations />

      {/* ปรับ padding และ spacing ให้กระชับขึ้น */}
      <div className="z-10 flex flex-1 justify-center items-center w-full px-4 py-6">
        <div className="flex flex-col gap-6 max-w-[440px] w-full">
          {/* Header section - ลด spacing */}
          <div className="flex items-center justify-center w-full">
            <div className="text-center flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl lg:text-6xl font-bold text-black">
                {text.header}
              </h1>
              <p className="text-[#7B7E8F] text-sm md:text-base lg:text-lg font-medium">
                {text.subHeader}
              </p>
            </div>
          </div>

          {/* Form section - ปรับ gap ให้กระชับ */}
          <div className="w-full flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Input fields */}
              <div className="flex flex-col gap-3">
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
              </div>

              {/* Register button */}
              <button
                type="submit"
                className="w-full bg-[#FF7037] text-white py-2.5 rounded-full font-bold hover:bg-[#FF986F] active:bg-[#E44A0C]"
              >
                Register
              </button>
            </form>

            {/* Divider - ลด margin */}
            <div className="flex items-center gap-3 w-full my-1">
              <div className="flex-grow border-t border-[#DCDFED]"></div>
              <span className="text-sm md:text-base text-[#7B7E8F]">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-[#DCDFED]"></div>
            </div>

            {/* Social buttons */}
            <SocialLoginButtons />

            {/* Login link และ Role switch - ปรับ spacing */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <p className="text-sm md:text-base font-medium text-[#060D18]">
                  {text.already}
                </p>
                <Link
                  href="/login"
                  className="text-[#FF7037] hover:text-[#FF986F] font-bold hover:underline text-sm md:text-base"
                >
                  Login
                </Link>
              </div>

              {/* Role switch button */}
              {role === "owner" ? (
                <button
                  type="button"
                  className="text-[#FF7037] hover:underline font-bold text-sm md:text-base cursor-pointer"
                  onClick={() => router.push("/register/sitter")}
                >
                  Become A Pet Sitter
                </button>
              ) : (
                <button
                  type="button"
                  className="text-[#FF7037] hover:underline font-bold text-sm md:text-base cursor-pointer"
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
