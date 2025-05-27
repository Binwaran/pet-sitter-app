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
  
  // สร้างฟังก์ชันแยกเพื่อลดการซ้ำซ้อน
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
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
            {menu.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleMenuClick(item.value)}
                className={`
                  flex items-center px-6 py-4 gap-4 
                  md:text-left justify-center md:justify-start text-center 
                  transition whitespace-nowrap cursor-pointer 
                  w-full h-[51px] md:h-[56px]
                  ${selected === item.value 
                    ? "bg-[#3A3B46] text-white font-semibold" 
                    : "hover:bg-[#3A3B46]"}
                `}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                />
                {item.label}
              </button>
            ))}
            
            {/* Logout button: แสดงเฉพาะบน mobile */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center px-6 py-4 gap-4 text-white md:hidden justify-center text-center hover:bg-[#3A3B46] transition whitespace-nowrap cursor-pointer"
            >
              <Image src={logout} alt="logout" width={24} height={24} />
              Log Out
            </button>
          </nav>
          
          {/* Logout button: แสดงเฉพาะบน desktop */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center px-6 py-4 gap-4 text-white hover:bg-[#3A3B46] transition whitespace-nowrap w-full border-t border-[#5B5D6F] h-[56px] cursor-pointer"
          >
            <Image src={logout} alt="logout" width={24} height={24} />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}