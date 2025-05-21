"use client";
import Image from "next/image";
import sitterlogo from "/public/assets/sitter-logo-white.svg";
import ownerIcon from "/public/assets/sidebar/profile.svg";
import sitterIcon from "/public/assets/sidebar/paw.svg";
import reportIcon from "/public/assets/sidebar/report.svg";
import logout from "/public/assets/sidebar/logout.svg";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const menu = [
  {
    label: "Pet Owner",
    alt: "owner",
    icon: ownerIcon,
    value: "pet-owners",
    path: "/admin/pet-owners",
  },
  {
    label: "Pet Sitter",
    alt: "sitter",
    icon: sitterIcon,
    value: "pet-sitters",
    path: "/admin/pet-sitters",
  },
  {
    label: "Report",
    alt: "report",
    icon: reportIcon,
    value: "report",
    path: "/admin/report",
  },
];

export default function Sidebar({ className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);

  const selected = menu.find((item) => pathname?.includes(item.value))?.value;

  const handleMenuClick = (value) => {
    router.push(`/admin/${value}`);
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
      md:border-r md:border-[#7B7E8F] bg-black relative
      md:sticky md:top-0 md:h-screen
      box-border max-h-screen
      ${className}
    `}
    >
      <div className="flex flex-col w-full h-full max-h-screen">
        <div className="hidden md:flex flex-col items-left w-full px-6 mb-6 mt-6">
          <button type="button" onClick={() => router.push("/")}>
            <Image
              src={sitterlogo}
              alt="sitter-logo"
              width={132}
              className="mt-1"
            />
          </button>
          <span className="text-[#7B7E8F] text-[16px] w-[90px] font-medium italic">
            Admin Panel
          </span>
        </div>
        <nav
          ref={navRef}
          className={`
          text-[16px] text-white
          flex flex-row md:flex-col
          overflow-x-auto md:overflow-x-visible
          min-w-0 w-full
          sticky top-0 z-20 bg-black md:static
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
            ? "bg-[#3A3B46] text-white font-semibold"
            : "hover:bg-[#3A3B46]"
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
            className="flex flex-row items-center px-6 py-3 md:text-left justify-center md:justify-start text-center hover:bg-[#3A3B46] transition whitespace-nowrap md:hidden"
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
            router.push("/login/admin");
          }}
          className="hidden md:flex items-center px-6 py-3 md:text-left justify-center md:justify-start text-center text-white hover:bg-[#3A3B46] transition whitespace-nowrap mt-auto w-full md:border-t border-[#5B5D6F] mb-4 md:h-[56px] h-[51px]"
        >
          <Image src={logout} alt="logout" width={20} className="mr-2" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
