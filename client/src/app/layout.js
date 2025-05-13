// src/app/layout.js
"use client";

import "../styles/globals.css"; // ถ้ามี global styles
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/login", "/register", "/pet-sitters/profile"];

  return (
    <html lang="en">
      <body>
        {!noLayoutRoutes.includes(pathname) && <NavBar />}
        <main>{children}</main>
        {!noLayoutRoutes.includes(pathname) && <Footer />}
      </body>
    </html>
  );
}
