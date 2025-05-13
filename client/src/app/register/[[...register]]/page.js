"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // นำเข้า useRouter
import InputField from "@/components/register/InputField.js"; 
import { validateEmail, validatePhone, validatePassword } from "@/components/InputVerification";

const RegisterPage = () => {
  const router = useRouter(); // สร้าง instance ของ router
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
          console.log("User saved:", data.user);
          router.push("/login"); // Redirect ไปยังหน้า Login
        } else {
          setErrors({ ...errors, general: data.error });
        }
      } catch (error) {
        console.error("Error during registration:", error);
        setErrors({ ...errors, general: "An unexpected error occurred." });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Join Us!</h1>
      <p style={styles.subtitle}>Find your perfect pet sitter with us</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          styles={styles} 
        />
        <InputField
          label="Phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          styles={styles} 
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          styles={styles} 
        />
        <div id="clerk-captcha" style={{ marginTop: "20px" }}></div>
        <button type="submit" style={styles.button}>
          Register
        </button>
        {errors.general && <p style={styles.error}>{errors.general}</p>}
      </form>
      <p style={styles.footerText}>
        Already have an account? <a href="/login" style={styles.link}>Login</a>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    textAlign: "center",
    fontFamily: "'Arial', sans-serif",
    padding: "20px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "20px",
  },
  form: {
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    color: "#333",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  error: {
    color: "red",
    fontSize: "0.875rem",
    marginTop: "5px",
  },
  button: {
    backgroundColor: "#FF6B35",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  footerText: {
    fontSize: "0.875rem",
    color: "#666",
  },
  link: {
    color: "#FF6B35",
    textDecoration: "none",
  },
};

export default RegisterPage;