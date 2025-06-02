"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBarMobile from "./navbar/NavBarMobile";
import NavBarDesktop from "./navbar/NavBarDesktop";
import { useAuth } from "@/context/AuthContext";

const NavBar = () => {
  const { user, loading, logout } = useAuth();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);
  const toggleMobileMenu = () => setMobileOpen((v) => !v);

  const handleLogout = async () => {
    await logout();
    alert("Logout successful");
    router.push("/");
  };

  useEffect(() => {
    if (!user) return;
    fetch("/api/unread-messages", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setHasNewMessage(data.unread > 0))
      .catch((err) => console.error("message error", err));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/unread-notifications", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setHasNewNotification(data.unread > 0))
      .catch((err) => console.error("notification error", err));
  }, [user]);

  // กำหนดสถานะ login จาก context
  const isLoggedIn = !!user;

  return (
    <>
      <NavBarMobile
        user={user}
        isLoggedIn={isLoggedIn}
        hasNewMessage={hasNewMessage}
        hasNewNotification={hasNewNotification}
        open={mobileOpen}
        toggleMobileMenu={toggleMobileMenu}
        handleLogout={handleLogout}
        className="block sm:hidden md:hidden lg:hidden"
      />
      <NavBarDesktop
        user={user}
        isLoggedIn={isLoggedIn}
        hasNewMessage={hasNewMessage}
        hasNewNotification={hasNewNotification}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
        handleLogout={handleLogout}
        className="hidden sm:hidden md:hidden lg:block"
      />
    </>
  );
};

export default NavBar;