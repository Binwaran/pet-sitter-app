"use client";
import Image from "next/image";
import { useEffect, useRef, useCallback, useMemo, memo } from "react";
import { usePathname, useRouter } from "next/navigation";

// Import assets
import sitterlogo from "/public/assets/sitter-logo.svg";
import profile from "/public/assets/sidebar/profile.svg";
import tab from "/public/assets/sidebar/tab.svg";
import calendar from "/public/assets/sidebar/calendar.svg";
import card from "/public/assets/sidebar/card.svg";
import logout from "/public/assets/sidebar/logout.svg";

// Menu configuration - moved outside component to prevent recreation on re-renders
const MENU_ITEMS = [
  {
    label: "Pet Sitter Profile",
    alt: "profile",
    icon: profile,
    value: "profile",
  },
  {
    label: "Booking List",
    alt: "booking-list",
    icon: tab,
    value: "booking-list",
  },
  { label: "Calendar", alt: "calendar", icon: calendar, value: "calendar" },
  { label: "Payout Option", alt: "payout", icon: card, value: "payout" },
];

// Extracted NavButton component to reduce repetitive code
const NavButton = memo(
  ({
    icon,
    label,
    onClick,
    isActive,
    isMobile,
    showInDesktop = true,
    className = "",
  }) => {
    const baseClasses =
      "flex flex-row items-center gap-3 md:gap-4 px-6 py-3 transition whitespace-nowrap";
    const mobileClasses =
      "md:text-left justify-center md:justify-start text-center";
    const activeClasses = isActive
      ? "bg-[#FEF3ED] text-[#FEA267] font-semibold"
      : "hover:bg-[#FFF1EC]";

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

    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${mobileClasses} ${activeClasses} ${visibilityClasses} ${sizeClasses} ${widthClasses} ${className}`}
      >
        <Image src={icon} alt={label} width={24} height={24} />
        {label}
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  }, [router]);

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
          <button type="button" onClick={() => router.push("/")}>
            <Image src={sitterlogo} alt="sitter-logo" width={132} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-full">
          {/* Navigation menu */}
          <nav
            ref={navRef}
            className="text-[16px] text-[#344054] flex flex-row md:flex-col
                     overflow-x-auto md:overflow-x-visible min-w-0 w-full
                     bg-[#FAFAFB] md:static hide-scrollbar"
            style={{ maxWidth: "100vw" }}
          >
            {/* Menu items - แสดงทุก device */}
            {MENU_ITEMS.map((item) => (
              <NavButton
                key={item.value}
                icon={item.icon}
                label={item.label}
                onClick={() => handleMenuClick(item.value)}
                isActive={selected === item.value}
              />
            ))}

            {/* Logout button - เฉพาะ mobile */}
            <NavButton
              icon={logout}
              label="Log Out"
              onClick={handleLogout}
              isMobile={true}
            />
          </nav>

          {/* Logout button - เฉพาะ desktop */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex flex-row items-center gap-4 px-6 py-3 w-full transition whitespace-nowrap border-t border-[#DCDFED] hover:bg-[#FFF1EC] md:h-[56px]"
          >
            <Image src={logout} alt="Log Out" width={24} height={24} />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
