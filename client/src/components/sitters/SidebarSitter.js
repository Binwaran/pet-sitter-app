"use client";
import Image from "next/image";
import { useEffect, useRef, useCallback, useMemo, memo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

// Import assets
import {
  ProfileIcon,
  TabIcon,
  CalendarIcon,
  CardIcon,
  LogoutIcon,
} from "@/components/icons";
import sitterlogo from "/public/assets/sitter-logo.svg";

// นำเข้า supabase client จากไฟล์ utility แทนการสร้างใหม่
import supabase from "@/utils/supabase";

// เพิ่มฟังก์ชัน CheckUnreadBookings component
const CheckUnreadBookings = memo(() => {
  const [hasUnread, setHasUnread] = useState(false);
  const { user } = useAuth();
  const lastChecked = useRef(0);

  // อัพเดทวิธีการเช็ค unread bookings
  const checkUnreadBookings = useCallback(async (force = false) => {
    try {
      // ไม่เช็คถ้ายังไม่ถึงเวลา except force=true
      if (!force && Date.now() - lastChecked.current < 30000) {
        return;
      }

      lastChecked.current = Date.now();

      // เรียกใช้ API เฉพาะสำหรับเช็คว่ามี unread bookings หรือไม่
      const res = await axios.get("/api/pet-sitters/unread-bookings-count", {
        withCredentials: true,
      });

      if (res.data && typeof res.data.hasUnread === "boolean") {
        setHasUnread(res.data.hasUnread);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // เช็คตอนโหลดหน้า
    checkUnreadBookings(true);

    // สร้าง channel name ที่ unique
    const channelName = `bookings-${user.id}-${Date.now()}`;

    // ตั้งค่า Realtime subscription อย่างถูกต้อง
    const bookingChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking",
          filter: `sitter_id=eq.${user.id}`,
        },
        (payload) => {
          // เมื่อมีการเปลี่ยนแปลงใน booking เช็คทันที
          checkUnreadBookings(true);
        }
      )
      .subscribe();

    // ลด polling interval เป็น 2 นาที แทน 30 วินาที
    const pollInterval = setInterval(() => checkUnreadBookings(true), 120000);

    // อีเว้นต์อื่นๆ ที่ควรเช็ค unread bookings
    window.addEventListener("focus", () => checkUnreadBookings(true));

    const handleStorageChange = (e) => {
      if (e.key === "sitterViewedBookings") {
        checkUnreadBookings(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      // Cleanup
      clearInterval(pollInterval);
      if (bookingChannel) {
        supabase.removeChannel(bookingChannel);
      }
      window.removeEventListener("focus", checkUnreadBookings);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user?.id, checkUnreadBookings]);

  return hasUnread ? (
    <span className="inline-block w-[8px] h-[8px] rounded-full bg-[#FF7037]" />
  ) : null;
});

CheckUnreadBookings.displayName = "CheckUnreadBookings";

// Menu configuration
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
      ? "bg-[#FFF1EC] text-[#FF7037] font-bold md:font-medium"
      : "hover:bg-[#FFF1EC] hover:text-[#FF7037] text-[#5B5D6F]";

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
      iconColor = "#FF986F";
    } else {
      // กำหนด class สำหรับ hover
      iconHoverClass = "group-hover:text-[#FF986F]";
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

// Main component
const Sidebar = memo(({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);
  const { logout, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Memoize the selected value
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
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      await logout();
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
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
            <Image
              src={sitterlogo}
              alt="sitter-logo"
              width={132}
              height={40}
              priority={true}
            />
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
                  item.value === "booking-list" && <CheckUnreadBookings />
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
            <LogoutIcon color="#AEB1C3" width={24} height={24} />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
