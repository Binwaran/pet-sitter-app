"use client";
import Image from "next/image";
import { useEffect, useRef, useCallback, useMemo, memo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { createClient } from "@supabase/supabase-js"; // เพิ่มการนำเข้า Supabase client

// Import assets
import {
  ProfileIcon,
  TabIcon,
  CalendarIcon,
  CardIcon,
  LogoutIcon,
} from "@/components/icons";
import sitterlogo from "/public/assets/sitter-logo.svg";

// สร้าง Supabase client สำหรับ realtime subscription
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// เพิ่มฟังก์ชัน CheckUnreadBookings component
const CheckUnreadBookings = memo(() => {
  const [hasUnread, setHasUnread] = useState(false);
  const { user } = useAuth(); // เพิ่มการใช้ user จาก context

  useEffect(() => {
    if (!user?.id) return; // ถ้าไม่มี user.id ให้ออกจาก effect

    // ฟังก์ชันเช็คการจองที่ยังไม่ได้อ่าน
    const checkUnreadBookings = async () => {
      try {
        // 1. ดึงข้อมูลการจองทั้งหมด
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/api/pet-sitters/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 2. ดึงรายการ ID ที่เคยดูแล้วจาก localStorage
        const viewedBookings = JSON.parse(
          localStorage.getItem("sitterViewedBookings") || "[]"
        );

        // 3. ตรวจสอบว่ามีการจองใดที่ยังไม่ได้ดู
        const bookings = res.data.data || [];
        const hasUnreadBooking = bookings.some(
          (booking) => !viewedBookings.includes(booking.id)
        );

        setHasUnread(hasUnreadBooking);
      } catch (error) {
        console.error("Error checking unread bookings:", error);
      }
    };

    // ตรวจสอบครั้งแรกเมื่อ component mount
    checkUnreadBookings();

    // สร้าง subscription สำหรับตาราง booking เพื่อติดตามการเปลี่ยนแปลงแบบ real-time
    const bookingChannel = supabase
      .channel("booking-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking",
          filter: `sitter_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New booking received:", payload);
          checkUnreadBookings(); // ตรวจสอบใหม่เมื่อมีการจองใหม่
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booking",
          filter: `sitter_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Booking updated:", payload);
          checkUnreadBookings(); // ตรวจสอบใหม่เมื่อมีการอัพเดทการจอง
        }
      )
      .subscribe();

    // ตรวจสอบทุกครั้งที่กลับมาที่หน้าต่าง (กรณีเปิดแท็บอื่นแล้วกลับมา)
    window.addEventListener("focus", checkUnreadBookings);

    // ตรวจสอบเมื่อมีการเปลี่ยนค่าใน localStorage (กรณีมีการอ่านการจองในแท็บอื่น)
    const handleStorageChange = (e) => {
      if (e.key === "sitterViewedBookings") {
        checkUnreadBookings();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // ยกเลิกการ subscribe และ event listeners เมื่อ component unmounts
    return () => {
      supabase.removeChannel(bookingChannel);
      window.removeEventListener("focus", checkUnreadBookings);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user?.id]); // dependency array ให้ re-run เมื่อ user.id เปลี่ยน

  return hasUnread ? (
    <span className="inline-block w-[8px] h-[8px] rounded-full bg-[#FF7037]" />
  ) : null;
});

CheckUnreadBookings.displayName = "CheckUnreadBookings";

// Menu configuration - moved outside component to prevent recreation on re-renders
const MENU_ITEMS = [
  {
    label: "Pet Sitter Profile",
    alt: "profile",
    icon: ProfileIcon,
    value: "profile",
  },
  {
    label: "Booking List",
    alt: "booking-list",
    icon: TabIcon,
    value: "booking-list",
  },
  {
    label: "Calendar",
    alt: "calendar",
    icon: CalendarIcon,
    value: "calendar",
  },
  {
    label: "Payout Option",
    alt: "payout",
    icon: CardIcon,
    value: "payout",
  },
];

// Extracted NavButton component to reduce repetitive code
const NavButton = memo(
  ({
    icon: Icon,
    label,
    onClick,
    isActive,
    isMobile,
    showInDesktop = true,
    className = "",
    hasNotification = false,
  }) => {
    const baseClasses =
      "flex items-center gap-3 md:gap-4 px-6 py-4 transition whitespace-nowrap cursor-pointer";
    const mobileClasses =
      "md:text-left justify-center md:justify-start text-center text-[18px] md:text-[16px] font-bold md:font-medium";
    const activeClasses = isActive
      ? "bg-[#FFF1EC] text-[#FF7037] md:text-[#FEA267] font-bold md:font-medium"
      : "hover:bg-[#FFF1EC] hover:text-[#FF7037] md:hover:text-[#FEA267] text-[#5B5D6F]";

    // แก้ไขส่วนนี้ - เปลี่ยนวิธีจัดการ visibility
    // แสดงปกติบน mobile สำหรับปุ่มทั่วไป และแสดงเฉพาะบน desktop ถ้า showInDesktop=true
    let visibilityClasses = "";
    if (isMobile) {
      visibilityClasses = "md:hidden"; // แสดงเฉพาะบน mobile
    } else if (!showInDesktop) {
      visibilityClasses = "hidden"; // ซ่อนหมด
    }

    const sizeClasses = "md:h-[56px] h-[51px]";
    const widthClasses = "w-full";
    let iconColor = "#AEB1C3"; // default color
    let iconHoverClass = "";

    if (isActive) {
      iconColor = isMobile ? "#FF7037" : "#FF986F";
    } else {
      // กำหนด class สำหรับ hover ตามประเภทอุปกรณ์
      iconHoverClass = isMobile
        ? "group-hover:text-[#FF7037]"
        : "group-hover:text-[#FF986F]";
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className={`group ${baseClasses} ${mobileClasses} ${activeClasses} ${visibilityClasses} ${sizeClasses} ${widthClasses} ${className}`}
      >
        <div
          className={`${!isActive ? `text-[#AEB1C3] ${iconHoverClass}` : ""}`}
        >
          <Icon
            color={isActive ? iconColor : "currentColor"}
            width={24}
            height={24}
          />
        </div>
        <div className="flex flex-row items-center gap-1 w-full">
          <span>{label}</span>
          {hasNotification && (
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#FF7037]" />
          )}
        </div>
      </button>
    );
  }
);

NavButton.displayName = "NavButton";

// Main component wrapped in memo to prevent unnecessary re-renders
const Sidebar = memo(({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);
  const { logout, user } = useAuth(); // เพิ่มการใช้ user จาก context
  const [hasUnreadBookings, setHasUnreadBookings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ตรวจสอบสถานะการอ่านการจองแบบ realtime
  useEffect(() => {
    if (!user?.id) return; // ถ้าไม่มี user.id ให้ออกจาก effect

    const checkUnreadBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/api/pet-sitters/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const viewedBookings = JSON.parse(
          localStorage.getItem("sitterViewedBookings") || "[]"
        );

        const bookings = res.data.data || [];
        const hasUnread = bookings.some(
          (booking) => !viewedBookings.includes(booking.id)
        );

        setHasUnreadBookings(hasUnread);
      } catch (error) {
        console.error("Error checking unread bookings:", error);
      }
    };

    // ตรวจสอบครั้งแรก
    checkUnreadBookings();

    // สร้าง subscription สำหรับตาราง booking เพื่อติดตามการเปลี่ยนแปลงแบบ real-time
    const bookingChannel = supabase
      .channel("sidebar-booking-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking",
          filter: `sitter_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New booking received in sidebar:", payload);
          checkUnreadBookings();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booking",
          filter: `sitter_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Booking updated in sidebar:", payload);
          checkUnreadBookings();
        }
      )
      .subscribe();

    // ตรวจสอบทุกครั้งที่กลับมาที่หน้าต่าง
    window.addEventListener("focus", checkUnreadBookings);

    // ตรวจสอบเมื่อมีการเปลี่ยนค่าใน localStorage
    const handleStorageChange = (e) => {
      if (e.key === "sitterViewedBookings") {
        checkUnreadBookings();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // ยกเลิกการ subscribe และ event listeners
    return () => {
      supabase.removeChannel(bookingChannel);
      window.removeEventListener("focus", checkUnreadBookings);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user?.id]); // dependency array ให้ re-run เมื่อ user.id เปลี่ยน

  // Memoize the selected value to prevent recalculation
  const selected = useMemo(
    () => MENU_ITEMS.find((item) => pathname?.includes(item.value))?.value,
    [pathname]
  );

  // Use useCallback for event handlers to prevent recreation on each render
  const handleMenuClick = useCallback(
    (value) => {
      router.push(`/pet-sitters/${value}`);
    },
    [router]
  );

  const handleLogout = async () => {
    await logout();
    alert("Logout successful");
    router.push("/");
  };

  // Setup horizontal scrolling for mobile
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
      w-full md:w-[240px] md:max-w-[240px]
      flex flex-row md:flex-col
      items-center md:items-stretch
      md:border-r border-[#DCDFED] bg-[#FAFAFB] 
      md:sticky md:top-0 md:h-screen
      ${className}`}
    >
      <div className="flex flex-col w-full h-full md:py-4">
        {/* Logo - desktop only */}
        <div className="hidden md:flex w-full px-6 pt-6 pb-10 gap-4">
          <button
            className="cursor-pointer"
            type="button"
            onClick={() => router.push("/")}
          >
            <Image src={sitterlogo} alt="sitter-logo" width={132} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-full">
          {/* Navigation menu */}
          <nav
            ref={navRef}
            className="text-[16px] text-[#5B5D6F] flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible w-full bg-[#FAFAFB] md:static hide-scrollbar"
            style={{ maxWidth: "100vw" }}
          >
            {/* แก้ไขส่วนของ MENU_ITEMS map เพื่อเพิ่มจุดแจ้งเตือนเฉพาะที่ booking-list */}
            {MENU_ITEMS.map((item) => (
              <NavButton
                key={item.value}
                icon={item.icon}
                label={item.label}
                onClick={() => handleMenuClick(item.value)}
                isActive={selected === item.value}
                hasNotification={
                  item.value === "booking-list" && hasUnreadBookings
                }
                isMobile={isMobile}
              />
            ))}

            {/* Logout button - เฉพาะ mobile */}
            <NavButton
              icon={LogoutIcon}
              label="Log Out"
              onClick={handleLogout}
              isMobile={true}
            />
          </nav>

          {/* Logout button - เฉพาะ desktop */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex flex-row items-center gap-4 px-6 py-3 w-full transition whitespace-nowrap border-t border-[#DCDFED] hover:bg-[#FFF1EC] md:h-[56px] text-[#5B5D6F] font-medium cursor-pointer"
          >
            <LogoutIcon color="#AEB1C3" width={16} height={20} />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
