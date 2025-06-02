"use client";
import React, { useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

// นำเข้าไฟล์รูปภาพ
import sitterlogo from "/public/assets/sitter-logo-white.svg";
import ownerIcon from "/public/assets/sidebar/profile.svg";
import sitterIcon from "/public/assets/sidebar/paw.svg";
import reportIcon from "/public/assets/sidebar/report.svg";
import logout from "/public/assets/sidebar/logout.svg";

// ย้าย constants ออกมาด้านนอกเพื่อไม่ต้องสร้างใหม่ทุกครั้ง
const MENU_ITEMS = [
  { label: "Pet Owner", alt: "owner", icon: ownerIcon, value: "pet-owners" },
  {
    label: "Pet Sitter",
    alt: "sitter",
    icon: sitterIcon,
    value: "pet-sitters",
  },
  { label: "Report", alt: "report", icon: reportIcon, value: "report" },
];

// สร้าง component ย่อยสำหรับ menu item
const MenuItem = memo(({ item, isSelected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(item.value)}
    className={`
      flex items-center px-6 py-4 gap-4 
      md:text-left justify-center md:justify-start text-center 
      transition whitespace-nowrap cursor-pointer 
      w-full h-[51px] md:h-[56px]
      ${
        isSelected
          ? "bg-[#3A3B46] text-white font-semibold"
          : "hover:bg-[#3A3B46]"
      }
    `}
  >
    <Image src={item.icon} alt={item.label} width={24} height={24} />
    {item.label}
  </button>
));

MenuItem.displayName = "MenuItem";

// สร้าง component สำหรับปุ่ม Logout
const LogoutButton = memo(({ onClick, isMobile = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center px-6 py-4 gap-4 text-white 
      ${
        isMobile
          ? "md:hidden justify-center text-center hover:bg-[#3A3B46] transition whitespace-nowrap cursor-pointer"
          : "hidden md:flex hover:bg-[#3A3B46] transition whitespace-nowrap w-full border-t border-[#5B5D6F] h-[56px] cursor-pointer"
      }
    `}
  >
    <Image src={logout} alt="logout" width={24} height={24} />
    Log Out
  </button>
));

LogoutButton.displayName = "LogoutButton";

const Sidebar = memo(({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);

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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  }, [router]);

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
              text-[16px] text-white
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

Sidebar.displayName = "Sidebar";

export default Sidebar;
