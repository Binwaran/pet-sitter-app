"use client";

import { memo, useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import avatar from "/public/assets/profile/profileimg.svg";
import message from "/public/assets/sidebar/message.svg";
import useUnreadMessages from "@/hooks/message/useUnreadMessages";
import UnreadMessageBadge from "@/components/common/UnreadMessageBadge";
import { useNavigation } from "@/hooks/message/useNavigation";

// ใช้ memo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
const Topbar = memo(({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { saveReferrer } = useNavigation();

  // รวม state เข้าด้วยกันเพื่อลดการ render
  const [state, setState] = useState({
    loading: true,
    name: "",
    profile_image_url: null,
    user_id: null,
    error: null,
  });

  const unreadCount = useUnreadMessages(state.user_id || "");

  // ฟังก์ชันสำหรับ navigate ไปยังหน้า profile
  const handleProfileClick = useCallback(() => {
    router.push("/pet-sitters/profile");
  }, [router]);

  // ใช้ useCallback เพื่อไม่ให้สร้างฟังก์ชันใหม่ทุกครั้งที่ render
  const fetchUserData = useCallback(async () => {
    try {
      // แก้ไขส่วนนี้: ใช้ API /api/me ที่ตรวจสอบ token จาก cookie
      const res = await axios.get("/api/me", {
        withCredentials: true, // ส่ง cookie ไปด้วย
      });

      if (res.data && res.data.id) {
        // ดึงข้อมูล user จาก API ที่ใช้ cookie แทน localStorage
        const userRes = await axios.get(`/api/users/${res.data.id}`, {
          withCredentials: true,
        });

        setState({
          loading: false,
          name: userRes.data?.name || "",
          profile_image_url: userRes.data?.profile_image_url || null,
          user_id: res.data.id,
          error: null,
        });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
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
      className={`flex items-center justify-between h-[72px] bg-white px-4 md:px-15 py-4 ${className}`}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#DCDFED]">
          <Image
            src={profileImage}
            alt="Avatar"
            fill
            sizes="40px"
            onClick={handleProfileClick} // แก้เป็นใช้ฟังก์ชัน handleProfileClick
            className="object-cover cursor-pointer rounded-full"
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
        <button
          onClick={() => {
            saveReferrer(pathname);
            router.push("/messages");
          }}
          className="relative w-10 h-10 rounded-full bg-[#F6F6F9] hover:bg-[#EDEDF2] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Messages"
        >
          <Image src={message} alt="Message" width={20} height={20} />
          {unreadCount > 0 && (
            <div className="absolute top-[2px] right-[2px]">
              <UnreadMessageBadge count={unreadCount} size="sm" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
});

// เพิ่ม displayName เพื่อช่วยในการ debug
Topbar.displayName = "Topbar";

export default Topbar;
