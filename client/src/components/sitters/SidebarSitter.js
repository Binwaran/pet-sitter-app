"use client";
import Image from "next/image";
import sitterlogo from "/public/assets/sitter-logo.svg";
import profile from "/public/assets/profile/profile.svg";
import tab from "/public/assets/profile/tab.svg";
import calendar from "/public/assets/profile/calendar.svg";
import card from "/public/assets/profile/card.svg";
import logout from "/public/assets/profile/logout.svg";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const menu = [
  {
    label: "Pet Sitter Profile",
    icon: profile,
    value: "profile",
  },
  {
    label: "Booking List",
    icon: tab,
    value: "booking",
  },
  {
    label: "Calendar",
    icon: calendar,
    value: "calendar",
  },
  {
    label: "Payout Option",
    icon: card,
    value: "payout",
  },
];

export default function Sidebar({ className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);

  const selected = menu.find(item => pathname?.includes(item.value))?.value;

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
      w-full md:w-[240px] max-w-full
      flex flex-row md:flex-col
      items-center md:items-stretch
      border-t md:border-t-0 md:border-r border-[#EAECF0] bg-white relative
      md:sticky md:top-0 md:h-screen
      ${className}
    `}
    >
      <div className="flex flex-col w-full h-full">
        <div className="hidden md:flex w-full px-6 mb-6 mt-6">
          <button
            type="button"
            onClick={() => router.push("/")}
          >
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
           md:space-y-1
          overflow-x-auto md:overflow-x-visible
          min-w-0 w-full
          sticky top-0 z-20 bg-white md:static
          hide-scrollbar
        `}
          style={{ maxWidth: "100vw" }}
        >
          {menu.map((item) => (
    <button
      key={item.value}
      type="button"
      onClick={() => handleMenuClick(item.value)}
      className={`flex flex-row items-center px-6 py-3 text-left transition whitespace-nowrap
        ${
          selected === item.value
            ? "bg-[#FEF3ED] text-[#FEA267] font-semibold"
            : "hover:bg-[#F9FAFB]"
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
            className="flex flex-row items-center px-6 py-3 text-left hover:bg-[#F9FAFB] rounded-lg transition whitespace-nowrap md:hidden"
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
          className="hidden md:flex items-center px-6 py-3 text-left hover:bg-[#F9FAFB] rounded-lg transition whitespace-nowrap mt-auto w-full"
        >
          <Image src={logout} alt="logout" width={20} className="mr-2" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
