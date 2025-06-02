// src/components/profile/Sidebar.js

"use client"; // ✅ ต้องมีเพื่อใช้ usePathname ใน component ฝั่ง client

import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ ใช้ตรวจ path ปัจจุบัน

const menuItems = [
  { label: "Profile", href: "/pet-owners/profile", icon: "/assets/icon=user.png" },
  { label: "Your Pet", href: "/pet-owners/pets", icon: "/assets/icon=pet.png" },
  { label: "Booking History", href: "/pet-owners/booking-history", icon: "/assets/icon=list-ul.png" },
  { label: "Change Password", href: "/pet-owners/change-password", icon: "/assets/icon=list-ul.png" },
];

export default function Sidebar() {
  const pathname = usePathname(); // ✅ ดึง path ปัจจุบันมาใช้งาน

  return (
    <div className="w-full md:w-64 bg-white rounded-xl shadow-sm p-4 self-start">
      <h2 className="text-lg font-semibold mb-2 px-4 py-2">Account</h2>
      <ul className="space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href; // ✅ เช็คว่าหน้านี้ตรงกับ path ปัจจุบันหรือไม่

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded transition
                  ${isActive 
                    ? "bg-[#FFF1EC] text-orange-500 font-medium" // ✅ ถ้ากำลังอยู่ในหน้านี้
                    : "text-gray-700 hover:bg-orange-100 hover:text-orange-500 hover:font-medium"
                  }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-5 h-5 opacity-70 ${isActive ? "opacity-100" : "group-hover:opacity-100"}`} // ✅ ไอคอนชัดเมื่อ active
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}