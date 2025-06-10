import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  // โหลด user จาก /api/me ตอน mount
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      // เพิ่ม logging เพื่อดีบัก
      console.log("Fetching user data...");

      const res = await fetch("/api/me", {
        credentials: "include", // สำคัญมาก! ต้องส่ง cookies ไปด้วย
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", res.status);

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
    setLoading(false);
  };

  // เพิ่มฟังก์ชัน updateUserData สำหรับอัพเดทข้อมูล user โดยตรง
  const updateUserData = (newUserData) => {
    if (newUserData && typeof newUserData === "object") {
      console.log("Updating user data in context:", newUserData);
      setUser(newUserData);
    } else {
      console.error("Invalid user data format for update:", newUserData);
    }
  };

  // login function
  const login = async (email, password) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // สำคัญมาก!
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        console.log("Login successful, fetching user info...");
        await fetchUser(); // ดึงข้อมูล user ใหม่
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "An error occurred during login" };
    }
  };

  // logout function
  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        redirectPath,
        setRedirectPath,
        updateUserData, // เพิ่มฟังก์ชันนี้
        fetchUser, // ส่งออกฟังก์ชันนี้ด้วย
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// custom hook
export function useAuth() {
  return useContext(AuthContext);
}
