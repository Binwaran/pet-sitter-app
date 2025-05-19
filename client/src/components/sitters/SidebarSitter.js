"use client";
import Image from "next/image";
import sitterlogo from "/public/assets/sitter-logo.svg";
import profile from "/public/assets/sidebar/profile.svg";
import tab from "/public/assets/sidebar/tab.svg";
import calendar from "/public/assets/sidebar/calendar.svg";
import card from "/public/assets/sidebar/card.svg";
import logout from "/public/assets/sidebar/logout.svg";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const menu = [
  {
    label: "Pet Sitter Profile",
    alt: "profile",
    icon: profile,
    value: "profile",
  },
  {
    label: "Booking List",
    alt: "booking",
    icon: tab,
    value: "booking",
  },
  {
    label: "Calendar",
    alt: "calendar",
    icon: calendar,
    value: "calendar",
  },
  {
    label: "Payout Option",
    alt: "payout",
    icon: card,
    value: "payout",
  },
];

export default function Sidebar({ className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);

  const selected = menu.find((item) => pathname?.includes(item.value))?.value;

  const handleMenuClick = (value) => {
    router.push(`/pet-sitters/${value}`);
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
    w-full md:w-[240px] md:max-w-[240px]
    flex flex-row md:flex-col
    items-center md:items-stretch
    md:border-r border-[#DCDFED] bg-[#FAFAFB] relative
    md:sticky md:top-0 md:h-screen
    box-border
    ${className}
  `}
    >
      <div className="flex flex-col w-full h-full">
        <div className="hidden md:flex w-full px-6 mb-6 mt-6">
          <button type="button" onClick={() => router.push("/")}>
            <Image
              src={sitterlogo}
              alt="sitter-logo"
              width={106}
              className="mt-1"
            />
          </button>
        </div>
        <nav
          ref={navRef}
          className={`
          text-[16px] text-[#344054]
          flex flex-row md:flex-col
          overflow-x-auto md:overflow-x-visible
          min-w-0 w-full
          sticky top-0 z-20 bg-[#FAFAFB] md:static
          hide-scrollbar
        `}
          style={{ maxWidth: "100vw" }}
        >
          {menu.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleMenuClick(item.value)}
              className={`flex flex-row items-center px-6 py-3 md:text-left justify-center md:justify-start text-center transition whitespace-nowrap w-full md:h-[56px] h-[51px]
        ${
          selected === item.value
            ? "bg-[#FEF3ED] text-[#FEA267] font-semibold"
            : "hover:bg-[#FFF1EC]"
        }
        md:w-full
      `}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                className="mr-2"
              />
              {item.label}
            </button>
          ))}
          {/* Logout button: แสดงใน nav เฉพาะ mobile */}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("accessToken");
              router.push("/");
            }}
            className="flex flex-row items-center px-6 py-3 md:text-left justify-center md:justify-start text-center hover:bg-[#FFF1EC] transition whitespace-nowrap md:hidden"
          >
            <Image src={logout} alt="logout" width={20} className="mr-2" />
            Log Out
          </button>
        </nav>
        {/* Logout button: แสดงเฉพาะ desktop และอยู่ล่างสุด */}
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("accessToken");
            router.push("/login/sitter");
          }}
          className="hidden md:flex items-center px-6 py-3 md:text-left justify-center md:justify-start text-center hover:bg-[#FFF1EC] transition whitespace-nowrap mt-auto w-full md:border-t border-[#DCDFED] mb-4 md:h-[56px] h-[51px]"
        >
          <Image src={logout} alt="logout" width={20} className="mr-2" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
