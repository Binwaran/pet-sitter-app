"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/register/InputField.js";
import { validateEmail, validatePhone, validatePassword } from "@/components/InputVerification";
import Link from "next/link";
import AuthIllustrations from "@/components/Auth/AuthIllustrations"; // เพิ่มถ้ามีไฟล์นี้

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
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

    setErrors(newErrors);
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
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration successful!");
          router.push("/login");
        } else {
          setErrors({ ...errors, general: data.error });
        }
      } catch (error) {
        setErrors({ ...errors, general: "An unexpected error occurred." });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative bg-white">
      <AuthIllustrations />
      <div className="z-10 flex flex-1 justify-center items-start p-6 md:p-16 mt-10 md:mt-24">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center mb-2">Join Us!</h1>
          <p className="text-center text-gray-600 mb-6">Find your perfect pet sitter with us</p>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-full transition font-semibold"
            >
              Register
            </button>
            {errors.general && <p className="text-red-500 text-sm mt-2">{errors.general}</p>}
          </form>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;