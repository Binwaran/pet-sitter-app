// src/app/layout.js
"use client";

import "../styles/globals.css"; // ถ้ามี global styles
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner"; // ✅ เพิ่ม toast

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
    "/admin/pet-sitters",
    "/admin/pet-sitters/[id]",
    "/admin/report",
    "/admin/report/[id]",
  ];

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {!noLayoutRoutes.includes(pathname) && <NavBar />}
          <main>{children}</main>
          {!noLayoutRoutes.includes(pathname) && <Footer />}
        </ClerkProvider>
        <Toaster richColors position="top-center" /> {/* ✅ เพิ่มตรงนี้ */}
      </body>
    </html>
  );
}
