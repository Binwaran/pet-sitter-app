"use client";
import React, { useEffect, useRef, useCallback, memo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// นำเข้าไฟล์รูปภาพ
import {
  ProfileIcon,
  PawIcon,
  ReportIcon,
  LogoutIcon,
} from "@/components/icons";
import sitterlogo from "/public/assets/sitter-logo-white.svg";

// ย้าย constants ออกมาด้านนอกเพื่อไม่ต้องสร้างใหม่ทุกครั้ง
const MENU_ITEMS = [
  { label: "Pet Owner", alt: "owner", icon: ProfileIcon, value: "pet-owners" },
  {
    label: "Pet Sitter",
    alt: "sitter",
    icon: PawIcon,
    value: "pet-sitters",
  },
  { label: "Report", alt: "report", icon: ReportIcon, value: "report" },
];

// สร้าง component ย่อยสำหรับ menu item
const MenuItem = memo(({ item, isSelected, onClick, isMobile }) => {
  const { icon: Icon, label } = item;

  // กำหนดสีของไอคอนตามสถานะการเลือกและขนาดหน้าจอ
  let iconColor = "#AEB1C3"; // default color
  let iconHoverClass = "";

  if (isSelected) {
    iconColor = "#FFFFFF";
  } else {
    // กำหนด class สำหรับ hover ตามประเภทอุปกรณ์
    iconHoverClass = "group-hover:text-white";
  }

  return (
    <button
      type="button"
      onClick={() => onClick(item.value)}
      className={`
        group flex items-center px-6 py-4 gap-3 md:gap-4 
        md:text-left justify-center md:justify-start text-center font-medium 
        transition whitespace-nowrap cursor-pointer 
        w-full h-[51px] md:h-[56px]
        ${
          isSelected
            ? "bg-[#3A3B46] text-white font-medium"
            : "hover:bg-[#3A3B46] hover:text-white text-[#AEB1C3]"
        }
      `}
    >
      <div
        className={`${!isSelected ? `text-[#AEB1C3] ${iconHoverClass}` : ""}`}
      >
        <Icon
          color={isSelected ? iconColor : "currentColor"}
          width={24}
          height={24}
        />
      </div>
      <span>{label}</span>
    </button>
  );
});

// สร้าง component สำหรับปุ่ม Logout
const LogoutButton = memo(({ onClick, isMobile = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      group flex items-center px-6 py-4 gap-3 md:gap-4 
      ${
        isMobile
          ? "md:hidden justify-center text-center hover:bg-[#3A3B46] transition whitespace-nowrap cursor-pointer font-medium"
          : "hidden md:flex hover:bg-[#3A3B46] transition whitespace-nowrap w-full border-t border-[#5B5D6F] h-[56px] cursor-pointer font-medium"
      }
      text-[#AEB1C3] hover:text-white
    `}
  >
    <div className="text-[#AEB1C3] group-hover:text-white">
      <LogoutIcon color="currentColor" width={24} height={24} />
    </div>
    <span>Log Out</span>
  </button>
));

LogoutButton.displayName = "LogoutButton";

const Sidebar = memo(({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // เพิ่มการตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // หา value ของเมนูที่เลือกจาก pathname
  const selectedValue = MENU_ITEMS.find((item) =>
    pathname?.includes(item.value)
  )?.value;

  // ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ทุกครั้งที่ render
  const handleMenuClick = useCallback(
    (value) => {
      router.push(`/admin/${value}`);
    },
    [router]
  );

  const handleLogout = async () => {
    try {
      // เรียกใช้ logout API เพื่อล้าง cookie
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      // ล้าง localStorage เฉพาะส่วนที่ไม่เกี่ยวข้องกับ authentication
      localStorage.removeItem("adminViewedItems"); // เก็บข้อมูล admin ที่ดูแล้ว

      // เรียกใช้ฟังก์ชัน logout จาก context
      await logout();

      // รีโหลดเพจเพื่อรีเซ็ตสถานะทั้งหมด
      window.location.href = "/";
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  // เพิ่ม useEffect สำหรับ wheel horizontal scroll
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        nav.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    nav.addEventListener("wheel", onWheel, { passive: false });
    return () => nav.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <aside
      className={`
        w-full md:w-[240px] 
        flex flex-row md:flex-col
        items-center md:items-stretch
        md:border-r md:border-[#5B5D6F] bg-black relative
        md:sticky md:top-0
        h-full md:h-screen
        ${className}
      `}
    >
      <div className="flex flex-col w-full h-full md:py-4">
        {/* Logo - แสดงเฉพาะบน Desktop */}
        <div className="hidden md:flex flex-col items-left w-full px-6 py-10 gap-1">
          <button type="button" onClick={() => router.push("/")}>
            <Image
              src={sitterlogo}
              alt="sitter-logo"
              width={132}
              height={40}
              priority={true}
              className="cursor-pointer"
            />
          </button>
          <span className="text-[#7B7E8F] text-[16px] font-medium italic">
            Admin Panel
          </span>
        </div>

        {/* เนื้อหาและปุ่ม Logout */}
        <div className="flex flex-col justify-between h-full">
          {/* เมนู Navigation */}
          <nav
            ref={navRef}
            className="
              text-[16px] text-[#AEB1C3]
              flex flex-row md:flex-col
              overflow-x-auto md:overflow-visible
              w-full
              sticky top-0 z-20 bg-black md:static
              hide-scrollbar h-[51px] md:h-auto
            "
            style={{ maxWidth: "100vw" }}
          >
            {MENU_ITEMS.map((item) => (
              <MenuItem
                key={item.value}
                item={item}
                isSelected={selectedValue === item.value}
                onClick={handleMenuClick}
                isMobile={isMobile}
              />
            ))}

            {/* Logout button: แสดงเฉพาะบน mobile */}
            <LogoutButton onClick={handleLogout} isMobile />
          </nav>

          {/* Logout button: แสดงเฉพาะบน desktop */}
          <LogoutButton onClick={handleLogout} />
        </div>
      </div>
    </aside>
  );
});

MenuItem.displayName = "MenuItem";
Sidebar.displayName = "Sidebar";

export default Sidebar;
