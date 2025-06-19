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
    "/login/sitter",
    "/login/owner",
    "/register",
    "/register/sitter",
    "/register/owner",
    "/pet-sitters/profile",
    "/pet-sitters/calendar",
    "/pet-sitters/payout",
    "/pet-sitters/booking-list",
    "/pet-sitters/booking-list/[id]",
    "/pet-sitters/profile/[id]",
    "/pet-sitters/calendar/[id]",
    "/pet-sitters/payout/[id]",
    "/admin",
    "/admin/pet-owners",
    "/admin/pet-owners/[userId]",
    "/admin/pet-sitters",
    "/admin/pet-sitters/[userId]",
    "/admin/report",
    "/admin/report/[id]",
    "/messages",
    "/messages/[id]",
  ];

  const isNoLayout = noLayoutRoutes.some(
    (route) =>
      route === pathname ||
      (route.includes("[userId]") &&
        pathname.startsWith(route.replace("[userId]", ""))) ||
      (route.includes("[id]") && pathname.startsWith(route.replace("[id]", "")))
  );

  const hideFooter =
    pathname.startsWith("/pet-owners/") ||
    pathname === "/pet-sitters/booking" ||
    pathname === "/pet-sitters/booking/information" ||
    pathname === "/pet-sitters/booking/payment" ||
    pathname === "/pet-sitters/booking/thankyou";

  return (
  <html lang="en">
    <body>
      <AuthProvider>
        <PetIdProvider>
          {!isNoLayout && <NavBar />}
          <main>{children}</main>
          {!isNoLayout && !hideFooter && <Footer />}
        </PetIdProvider>
      </AuthProvider>
      <Toaster richColors position="top-center" />
    </body>
  </html>
);
}
