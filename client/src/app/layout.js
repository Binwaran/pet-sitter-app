// src/app/layout.js
"use client";

import "../styles/globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner"; // ✅ เพิ่ม toast
import { AuthProvider } from "@/context/AuthContext";
import { PetIdProvider } from "@/context/PetIdContext";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const noLayoutRoutes = [
    "/login",
    "/register",
    "/pet-sitters/profile",
    "/pet-sitters/booking",
    "/pet-sitters/calendar",
    "/pet-sitters/payout",
    "/pet-sitters/booking/[id]",
    "/pet-sitters/profile/[id]",
    "/pet-sitters/calendar/[id]",
    "/pet-sitters/payout/[id]",
    "/admin",
    "/admin/pet-owners",
    "/admin/pet-owners/[userId]",
    "/admin/pet-sitters",
    "/admin/pet-sitters/[userId]",
    "/admin/report",
  ];

  const isNoLayout = noLayoutRoutes.some(
    (route) =>
      route === pathname ||
      (route.includes("[userId]") &&
        pathname.startsWith(route.replace("[userId]", ""))) ||
      (route.includes("[id]") && pathname.startsWith(route.replace("[id]", "")))
  );

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PetIdProvider>
            {!noLayoutRoutes.includes(pathname) && <NavBar />}
            <main>{children}</main>
            {!noLayoutRoutes.includes(pathname) && <Footer />}
          </PetIdProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" /> {/* ✅ เพิ่มตรงนี้ */}
      </body>
    </html>
  );
}
