"use client";

import { memo, useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import avatar from "/public/assets/profile/profileimg.svg";
import message from "/public/assets/sidebar/message.svg";

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
const Topbar = memo(({ className }) => {
  // รวม state เข้าด้วยกันเพื่อลดการ render
  const [state, setState] = useState({
    loading: true,
    name: "",
    profile_image_url: null,
    error: null,
  });

  // ใช้ useCallback เพื่อไม่ให้สร้างฟังก์ชันใหม่ทุกครั้งที่ render
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const decoded = jwtDecode(token);
      const user_id = decoded.user_id || decoded.sub || decoded.id;

      const res = await axios.get(`/api/users/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setState({
        loading: false,
        name: res.data?.name || "",
        profile_image_url: res.data?.profile_image_url || null,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, []);

  // เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อ component ถูกโหลด
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // ใช้ useMemo เพื่อคำนวณค่าเมื่อ dependencies เปลี่ยนเท่านั้น
  const profileImage = useMemo(() => {
    if (!state.profile_image_url) return avatar;

    // ตรวจสอบว่าเป็น URL ที่ถูกต้องหรือไม่
    try {
      return typeof state.profile_image_url === "string" &&
        state.profile_image_url.trim() !== ""
        ? state.profile_image_url
        : avatar;
    } catch {
      return avatar;
    }
  }, [state.profile_image_url]);

  const { loading, name } = state;

  return (
    <header
      className={`flex items-center justify-between h-[72px] bg-white px-4 sm:px-6 md:px-8 py-4 border-b border-[#E4E7EC] ${className}`}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#DCDFED]">
          <Image
            src={profileImage}
            alt="Avatar"
            width={40}
            height={40}
            className="object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = avatar.src;
            }}
          />
        </div>
        <span className="font-medium text-[#3A3B46] leading-7">
          {loading ? "Loading..." : name || "User"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-[#F6F6F9] hover:bg-[#EDEDF2] flex items-center justify-center">
          <Image src={message} alt="Message" width={20} height={20} />
        </button>
      </div>
    </header>
  );
});

// เพิ่ม displayName เพื่อช่วยในการ debug
Topbar.displayName = "Topbar";

export default Topbar;
