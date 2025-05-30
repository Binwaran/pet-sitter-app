// src/components/profile/Sidebar.js

import Link from "next/link";

const menuItems = [
  { label: "Profile", href: "/account/profile", icon: "/assets/icon=user.png" },
  { label: "Your Pet", href: "/account/your-pet", icon: "/assets/icon=pet.png" },
  { label: "Booking History", href: "/account/booking-history", icon: "/assets/icon=list-ul.png" },
  { label: "Change Password", href: "/account/change-password", icon: "/assets/icon=list-ul.png" },
];

export default function Sidebar() {
  return (
    <div className="w-full md:w-64 bg-white  rounded-xl shadow-sm p-4 self-start">
      <h2 className="text-lg font-semibold mb-2 px-4 py-2">Account</h2>
      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded text-gray-700 hover:bg-orange-100 hover:text-orange-500 hover:font-medium transition"
            >
              <img src={item.icon} alt={item.label} className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
