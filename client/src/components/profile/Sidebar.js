// src/components/profile/Sidebar.js

"use client"; // ✅ ต้องมีเพื่อใช้ usePathname ใน component ฝั่ง client

import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ ใช้ตรวจ path ปัจจุบัน
import { useRef, useEffect } from "react";
import { ProfileIcon, PawIcon, TabIcon } from "../icons";

const menuItems = [
  { label: "Profile", href: "/pet-owners/profile", icon: ProfileIcon },
  { label: "Your Pet", href: "/pet-owners/pets", icon: PawIcon },
  {
    label: "Booking History",
    href: "/pet-owners/booking-history",
    icon: TabIcon,
  },
  {
    label: "Change Password",
    href: "/pet-owners/change-password",
    icon: TabIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname(); // ✅ ดึง path ปัจจุบันมาใช้งาน
  const navRef = useRef(null);

  // เพิ่มการจัดการ horizontal scrolling สำหรับ mobile
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // จัดการเหตุการณ์ wheel สำหรับเลื่อนแนวนอน
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        nav.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    nav.addEventListener("wheel", onWheel, { passive: false });
    return () => nav.removeEventListener("wheel", onWheel);
  }, []);

  // เพิ่มฟังก์ชันเช็ค active path
  const isActivePath = (href) => {
    // เช็คว่าเป็นหน้า edit-pet หรือไม่
    if (pathname.includes('/pet-owners/edit-pet/')) {
      return href === '/pet-owners/pets';
    }
    return pathname === href;
  };

  return (
    <div className="w-full md:max-w-73 bg-white md:rounded-2xl md:py-6 shadow-sm self-start">
      <div className="hidden md:flex items-center justify-start pb-3 px-6">
        <h2 className="text-lg font-semibold">Account</h2>
      </div>

      {/* เมนู */}
      <ul
        ref={navRef}
        className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          ul::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {menuItems.map((item) => {
          const isActive = isActivePath(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-shrink-0">
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 md:py-5 font-bold transition whitespace-nowrap group
          ${
            isActive
              ? "bg-[#FFF1EC] text-[#FF7037] "
              : "text-[#5B5D6F] hover:bg-[#FFF1EC] hover:text-[#FF7037] "
          }`}
              >
                {/* ส่วนที่แก้ไข: ใช้ currentColor และแยก className ไปที่ div แรพเปอร์ */}
                <div
                  className={`w-5 h-5 flex items-center justify-center ${
                    !isActive
                      ? "text-[#AEB1C3] group-hover:text-[#FF7037]"
                      : "text-[#FF7037]"
                  }`}
                >
                  <Icon color="currentColor" width={20} height={20} />
                </div>
                <div className="text-lg font-bold leading-[150%]">
                  {item.label}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
